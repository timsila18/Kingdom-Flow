import { NextResponse } from "next/server";
import { demoSessionCookie } from "@/lib/demo-auth";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/auth/sign-in?logged_out=1", request.url), { status: 303 });
  response.cookies.set(demoSessionCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
