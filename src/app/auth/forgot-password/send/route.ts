import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { allowRequest } from "@/lib/rate-limit";
import { logEvent } from "@/lib/observability";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new NextResponse("Invalid request", { status: 403 });
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const url = new URL("/auth/forgot-password", request.url);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    url.searchParams.set("error", "Enter a valid email address.");
    return NextResponse.redirect(url, 303);
  }
  if (
    !(await allowRequest(request, {
      scope: "auth.password_reset",
      limit: 4,
      windowSeconds: 60 * 60,
      identity: email,
    }))
  ) {
    logEvent("warn", "auth.password_reset.rate_limited");
    url.searchParams.set("sent", "1");
    return NextResponse.redirect(url, 303);
  }
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: new URL("/auth/reset-password", request.url).href,
  });
  logEvent(error ? "warn" : "info", "auth.password_reset.requested", {
    providerAccepted: !error,
  });
  url.searchParams.set(
    error ? "error" : "sent",
    error
      ? "The reset email could not be sent. Please try again shortly."
      : "1",
  );
  return NextResponse.redirect(url, 303);
}
