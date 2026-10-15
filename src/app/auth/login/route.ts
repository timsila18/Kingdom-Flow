import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  appRefreshCookie,
  appSessionCookie,
  legacyDemoSessionCookie,
} from "@/lib/auth-constants";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { joinChurch } from "@/lib/church-joining";
import { allowRequest } from "@/lib/rate-limit";
import { logEvent } from "@/lib/observability";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const requestedNext = String(form.get("next") ?? "/auth/workspaces");
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/auth/workspaces";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !(await allowRequest(request, {
      scope: "auth.login",
      limit: 8,
      windowSeconds: 15 * 60,
      identity: email,
    }))
  ) {
    logEvent("warn", "auth.login.rate_limited");
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=too-many-attempts", request.url),
      { status: 303 },
    );
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=auth-not-configured", request.url),
      { status: 303 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    logEvent("warn", "auth.login.failed");
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=invalid-login", request.url),
      { status: 303 },
    );
  }

  await getSupabaseAdmin()
    .from("profiles")
    .upsert({
      id: data.user.id,
      email: data.user.email!,
      full_name: data.user.user_metadata?.full_name ?? data.user.email,
    });
  let destination =
    ["super_admin", "platform_admin"].includes(data.user.app_metadata?.role) &&
    next === "/auth/workspaces"
      ? "/platform"
      : next;
  if (
    data.user.email_confirmed_at &&
    typeof data.user.user_metadata?.requested_church_id === "string" &&
    data.user.user_metadata.requested_church_id
  ) {
    try {
      const slug = await joinChurch(
        {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.full_name || data.user.email!,
        },
        data.user.user_metadata.requested_church_id,
        String(data.user.user_metadata.phone ?? ""),
      );
      if (next === "/auth/workspaces") destination = `/workspace/${slug}`;
    } catch {
      destination = "/auth/join-church?error=join-unavailable";
    }
  }
  const response = NextResponse.redirect(new URL(destination, request.url), {
    status: 303,
  });
  response.cookies.set(appSessionCookie, data.session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: data.session.expires_in,
  });
  response.cookies.set(appRefreshCookie, data.session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set(legacyDemoSessionCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  logEvent("info", "auth.login.succeeded", { destination });

  return response;
}
