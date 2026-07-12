import { NextResponse } from "next/server";
import { demoSessionCookie, getDemoAccountByEmail } from "@/lib/demo-auth";
import { testLoginPassword } from "@/lib/data";

function createLoginResponse(email: string, origin: string, destination?: string) {
  const account = getDemoAccountByEmail(email);
  if (!account) return NextResponse.redirect(new URL("/auth/sign-in?error=unknown-user", origin), { status: 303 });
  const response = NextResponse.redirect(new URL(destination ?? account.path, origin), { status: 303 });
  response.cookies.set(demoSessionCookie, account.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") ?? "superadmin@kingdomflow.co.ke";
  return createLoginResponse(email, url.origin, url.searchParams.get("next") ?? undefined);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "");
  if (password !== testLoginPassword || !getDemoAccountByEmail(email)) {
    return NextResponse.redirect(new URL("/auth/sign-in?error=invalid-demo-login", request.url), { status: 303 });
  }
  const url = new URL(request.url);
  return createLoginResponse(email, url.origin, next || "/auth/workspaces");
}
