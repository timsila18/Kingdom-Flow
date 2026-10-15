import { NextResponse } from "next/server";
import {
  buildTenantFromRegistration,
  saveChurchRegistration,
} from "@/lib/tenant-store";
import { getCurrentUser } from "@/lib/app-auth";
import type { TenantStatus } from "@/lib/types";
import { allowRequest } from "@/lib/rate-limit";
import { logEvent } from "@/lib/observability";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new NextResponse("Invalid request", { status: 403 });
  const formData = await request.formData();
  if (!(await getCurrentUser()))
    return NextResponse.redirect(
      new URL("/auth/sign-in?next=/onboarding", request.url),
      303,
    );
  if (
    !(await allowRequest(request, {
      scope: "church.onboarding",
      limit: 12,
      windowSeconds: 60 * 60,
    }))
  )
    return NextResponse.redirect(
      new URL(
        "/onboarding?error=Please+wait+before+submitting+again.",
        request.url,
      ),
      303,
    );
  const status = (
    formData.get("intent") === "draft" ? "draft" : "under_review"
  ) satisfies TenantStatus;
  const tenant = buildTenantFromRegistration(formData, status);
  if (
    !tenant.publicName ||
    tenant.publicName === "Untitled Church" ||
    !tenant.contactEmail.includes("@") ||
    !String(formData.get("principalLeaderName") ?? "").trim() ||
    !formData.get("authorized")
  )
    return NextResponse.redirect(
      new URL(
        "/onboarding?error=Please+provide+church+details,+leadership+and+authorisation",
        request.url,
      ),
      303,
    );
  try {
    await saveChurchRegistration(tenant);
  } catch (error) {
    const url = new URL("/onboarding", request.url);
    url.searchParams.set(
      "error",
      error instanceof Error
        ? error.message
        : "Registration could not be saved.",
    );
    return NextResponse.redirect(url, 303);
  }
  const response = NextResponse.redirect(
    new URL(
      status === "draft"
        ? "/auth/workspaces"
        : `/auth/pending?church=${tenant.slug}`,
      request.url,
    ),
    303,
  );

  logEvent("info", "church.onboarding.saved", { status });

  return response;
}
