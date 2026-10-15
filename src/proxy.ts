import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { appRefreshCookie, appSessionCookie } from "@/lib/auth-constants";

export async function proxy(request: NextRequest) {
  let accessToken = request.cookies.get(appSessionCookie)?.value;
  const refreshToken = request.cookies.get(appRefreshCookie)?.value;
  let refreshedTokens:
    | { accessToken: string; refreshToken: string; expiresIn: number }
    | undefined;

  if (accessToken && refreshToken) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (url && key) {
      const auth = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await auth.auth.getUser(accessToken);
      if (error) {
        const { data } = await auth.auth.refreshSession({
          refresh_token: refreshToken,
        });
        if (data.session) {
          accessToken = data.session.access_token;
          refreshedTokens = {
            accessToken,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
          };
        } else {
          accessToken = undefined;
        }
      }
    }
  }
  const hasSession = Boolean(accessToken);

  function withRefreshedSession(response: NextResponse) {
    if (!refreshedTokens) return response;
    const options = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };
    response.cookies.set(appSessionCookie, refreshedTokens.accessToken, {
      ...options,
      maxAge: refreshedTokens.expiresIn,
    });
    response.cookies.set(appRefreshCookie, refreshedTokens.refreshToken, {
      ...options,
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  if (hasSession) {
    const parts = request.nextUrl.pathname.split("/").filter(Boolean);
    if (
      parts[0] === "workspace" &&
      parts.length > 2 &&
      !["work", "hr"].includes(parts[2])
    ) {
      const legacy: Record<string, string> = {
        people: "people",
        programmes: "classes",
        groups: "groups",
        services: "ministry",
        events: "events",
        giving: "giving",
        administration: "reports",
        intelligence: "reports",
        settings: "settings",
        users: "team",
        roles: "team",
        organization: "settings",
        branches: "branches",
        authority: "decisions",
        "pastoral-care": "care",
        member: "profile",
        digital: "ministry",
        audit: "reports",
        production: "settings",
        subscription: "settings",
      };
      const section =
        parts[2] === "people" && ["follow-up", "tasks"].includes(parts[3])
          ? "follow-up"
          : parts[2] === "services" && parts[3] === "departments"
            ? "departments"
            : legacy[parts[2]];
      return withRefreshedSession(
        NextResponse.redirect(
          new URL(
            section
              ? `/workspace/${parts[1]}/work/${section}`
              : `/workspace/${parts[1]}`,
            request.url,
          ),
        ),
      );
    }
    return withRefreshedSession(NextResponse.next());
  }

  const signIn = new URL("/auth/sign-in", request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/workspace/:path*", "/platform/:path*"],
};
