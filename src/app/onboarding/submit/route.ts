import { NextResponse } from "next/server";
import { buildTenantFromRegistration, legacyDemoTenantsCookie, readRegisteredTenants, registeredTenantsCookie, serializeRegisteredTenants, upsertRegisteredTenant } from "@/lib/tenant-store";
import type { TenantStatus } from "@/lib/types";

export async function POST(request: Request) {
  const formData = await request.formData();
  const status = (formData.get("intent") === "draft" ? "draft" : "under_review") satisfies TenantStatus;
  const tenant = buildTenantFromRegistration(formData, status);
  const rawCookie = request.headers.get("cookie");
  const match = rawCookie?.match(new RegExp(`${registeredTenantsCookie}=([^;]+)`));
  const current = readRegisteredTenants(match?.[1] ? decodeURIComponent(match[1]) : null);
  const response = NextResponse.redirect(new URL(status === "draft" ? "/auth/workspaces" : `/auth/pending?church=${tenant.slug}`, request.url), 303);

  response.cookies.set(registeredTenantsCookie, serializeRegisteredTenants(upsertRegisteredTenant(current, tenant)), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });
  response.cookies.delete(legacyDemoTenantsCookie);

  return response;
}
