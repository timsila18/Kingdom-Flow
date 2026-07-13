import { NextResponse } from "next/server";
import { buildTenantFromRegistration, demoTenantsCookie, readDemoTenants, serializeDemoTenants, upsertDemoTenant } from "@/lib/tenant-store";
import type { TenantStatus } from "@/lib/types";

export async function POST(request: Request) {
  const formData = await request.formData();
  const status = (formData.get("intent") === "draft" ? "draft" : "under_review") satisfies TenantStatus;
  const tenant = buildTenantFromRegistration(formData, status);
  const current = readDemoTenants(request.headers.get("cookie")?.match(new RegExp(`${demoTenantsCookie}=([^;]+)`))?.[1] ? decodeURIComponent(request.headers.get("cookie")?.match(new RegExp(`${demoTenantsCookie}=([^;]+)`))?.[1] ?? "") : null);
  const response = NextResponse.redirect(new URL(status === "draft" ? "/auth/workspaces" : `/auth/pending?church=${tenant.slug}`, request.url), 303);

  response.cookies.set(demoTenantsCookie, serializeDemoTenants(upsertDemoTenant(current, tenant)), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
