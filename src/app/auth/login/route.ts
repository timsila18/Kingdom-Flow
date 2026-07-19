import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { appSessionCookie, legacyDemoSessionCookie } from "@/lib/auth-constants";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const requestedNext = String(form.get("next") ?? "/auth/workspaces");
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/auth/workspaces";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/auth/sign-in?error=auth-not-configured", request.url), { status: 303 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.redirect(new URL("/auth/sign-in?error=invalid-login", request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL(next || "/auth/workspaces", request.url), { status: 303 });
  response.cookies.set(appSessionCookie, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  response.cookies.set(legacyDemoSessionCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
