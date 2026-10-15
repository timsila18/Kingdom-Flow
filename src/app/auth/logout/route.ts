import { NextResponse } from "next/server";
import {
  appRefreshCookie,
  appSessionCookie,
  legacyDemoSessionCookie,
} from "@/lib/auth-constants";

export function GET(request: Request) {
  const response = NextResponse.redirect(
    new URL(
      new URL(request.url).searchParams.get("reset") === "1"
        ? "/auth/sign-in?reset=1"
        : "/auth/sign-in?logged_out=1",
      request.url,
    ),
    { status: 303 },
  );

  for (const cookie of [
    appSessionCookie,
    appRefreshCookie,
    legacyDemoSessionCookie,
    "kingdomflow_active_type",
  ]) {
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
