import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { appSessionCookie } from "@/lib/auth-constants";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(appSessionCookie)?.value);
  if (hasSession) return NextResponse.next();

  const signIn = new URL("/auth/sign-in", request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/workspace/:path*", "/platform/:path*"],
};
