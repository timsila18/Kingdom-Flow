import { NextResponse } from "next/server";
import { tenants } from "@/lib/data";
import { demoTenantsCookie, readDemoTenants, serializeDemoTenants, setDemoTenantStatus, updateDemoTenantStatus } from "@/lib/tenant-store";
import type { TenantStatus } from "@/lib/types";

const statusByDecision: Record<string, TenantStatus> = {
  approve: "approved",
  clarification: "needs_clarification",
  reject: "rejected",
  suspend: "suspended",
  reactivate: "approved",
};

function readCookieValue(request: Request) {
  const match = request.headers.get("cookie")?.match(new RegExp(`${demoTenantsCookie}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const formData = await request.formData();
  const decision = String(formData.get("decision") ?? "");
  const status = statusByDecision[decision];

  if (!status) {
    return NextResponse.redirect(new URL(`/platform/churches/${slug}`, request.url), 303);
  }

  const current = readDemoTenants(readCookieValue(request));
  const tenant = current.find((item) => item.slug === slug) ?? tenants.find((item) => item.slug === slug);
  if (!tenant) {
    return NextResponse.redirect(new URL("/platform/churches", request.url), 303);
  }

  const updatedTenants = current.some((item) => item.slug === slug) ? updateDemoTenantStatus(current, slug, status) : setDemoTenantStatus(current, tenant, status);
  const response = NextResponse.redirect(new URL(`/platform/churches/${slug}?updated=${status}`, request.url), 303);
  response.cookies.set(demoTenantsCookie, serializeDemoTenants(updatedTenants), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
