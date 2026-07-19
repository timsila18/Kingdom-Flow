import { NextResponse } from "next/server";
import { appSessionCookie, legacyDemoSessionCookie } from "@/lib/auth-constants";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/auth/sign-in?logged_out=1", request.url), { status: 303 });

  for (const cookie of [appSessionCookie, legacyDemoSessionCookie]) {
    response.cookies.set(cookie, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}
