import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { demoSessionCookie } from "@/lib/auth-constants";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(demoSessionCookie)?.value);
  if (hasSession) return NextResponse.next();

  const signIn = new URL("/auth/sign-in", request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/workspace/:path*", "/platform/:path*"],
};
