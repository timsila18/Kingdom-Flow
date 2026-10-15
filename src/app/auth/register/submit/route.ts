import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { publicChurchOptions } from "@/lib/church-joining";
import { joinChurch } from "@/lib/church-joining";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { appRefreshCookie, appSessionCookie } from "@/lib/auth-constants";
import { allowRequest } from "@/lib/rate-limit";
import { logEvent } from "@/lib/observability";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new NextResponse("Invalid request", { status: 403 });
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const mode = String(form.get("mode") ?? "church");
  const churchId = String(form.get("churchId") ?? "");
  const phone = String(form.get("phone") ?? "")
    .trim()
    .slice(0, 50);
  if (
    !(await allowRequest(request, {
      scope: "auth.register",
      limit: 5,
      windowSeconds: 60 * 60,
      identity: email,
    }))
  ) {
    logEvent("warn", "auth.register.rate_limited");
    return NextResponse.redirect(
      new URL(
        "/auth/register?error=Please+wait+before+trying+again.",
        request.url,
      ),
      303,
    );
  }
  const url = new URL("/auth/register", request.url);
  url.searchParams.set("mode", mode);
  if (
    !["join", "church"].includes(mode) ||
    (mode === "join" &&
      !(await publicChurchOptions()).some((church) => church.id === churchId))
  ) {
    url.searchParams.set("error", "Select an available church.");
    return NextResponse.redirect(url, 303);
  }
  if (
    password.length < 12 ||
    !name ||
    name.length > 200 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    url.searchParams.set(
      "error",
      "Provide your name and a password of at least 12 characters.",
    );
    return NextResponse.redirect(url, 303);
  }
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  const admin = getSupabaseAdmin();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name.slice(0, 200),
      requested_church_id: mode === "join" ? churchId : "",
      phone,
    },
  });
  if (error) {
    logEvent("warn", "auth.register.failed");
    url.searchParams.set(
      "error",
      "Account could not be created. Check the details or sign in if you already have an account.",
    );
    return NextResponse.redirect(url, 303);
  }
  if (!created.user) {
    url.searchParams.set(
      "error",
      "Account could not be created. Please try again.",
    );
    return NextResponse.redirect(url, 303);
  }
  await admin
    .from("profiles")
    .upsert({ id: created.user.id, email, full_name: name });
  const { data: login, error: loginError } =
    await client.auth.signInWithPassword({ email, password });
  if (loginError || !login.session)
    return NextResponse.redirect(
      new URL("/auth/sign-in?registered=1", request.url),
      303,
    );
  let destination = "/onboarding";
  if (mode === "join") {
    try {
      const slug = await joinChurch(
        { id: created.user.id, email, name },
        churchId,
        phone,
        String(form.get("journeyStage") ?? "Visitor"),
      );
      destination = `/workspace/${slug}`;
    } catch {
      destination = "/auth/join-church?error=join-unavailable";
    }
  }
  const response = NextResponse.redirect(
    new URL(destination, request.url),
    303,
  );
  response.cookies.set(appSessionCookie, login.session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: login.session.expires_in,
  });
  response.cookies.set(appRefreshCookie, login.session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set("kingdomflow_active_type", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  logEvent("info", "auth.register.succeeded", { mode, destination });
  return response;
}
