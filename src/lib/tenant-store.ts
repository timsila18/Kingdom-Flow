import { cookies } from "next/headers";
import { tenants } from "./data";
import type { Tenant, TenantStatus } from "./types";

export const demoTenantsCookie = "kingdomflow_demo_tenants";

const defaultTenantColors = {
  primaryColor: "#10120d",
  secondaryColor: "#f8f1dd",
  accentColor: "#c9a24d",
};

export function slugifyTenantName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function readDemoTenants(rawValue?: string | null): Tenant[] {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue) as Tenant[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((tenant) => tenant && typeof tenant.id === "string" && typeof tenant.slug === "string" && typeof tenant.publicName === "string");
  } catch {
    return [];
  }
}

export function serializeDemoTenants(value: Tenant[]) {
  return JSON.stringify(value);
}

export function mergeTenants(demoTenants: Tenant[]) {
  const bySlug = new Map<string, Tenant>();
  for (const tenant of tenants) bySlug.set(tenant.slug, tenant);
  for (const tenant of demoTenants) bySlug.set(tenant.slug, tenant);
  return [...bySlug.values()].sort((first, second) => {
    const firstPending = first.status === "under_review" ? 0 : 1;
    const secondPending = second.status === "under_review" ? 0 : 1;
    return firstPending - secondPending || second.createdAt.localeCompare(first.createdAt);
  });
}

export async function getVisibleTenants() {
  const cookieStore = await cookies();
  return mergeTenants(readDemoTenants(cookieStore.get(demoTenantsCookie)?.value));
}

export async function getVisibleTenantBySlug(slug: string) {
  const visibleTenants = await getVisibleTenants();
  return visibleTenants.find((tenant) => tenant.slug === slug);
}

export function buildTenantFromRegistration(formData: FormData, status: TenantStatus) {
  const publicName = String(formData.get("publicName") ?? "").trim() || "Untitled Church";
  const legalName = String(formData.get("legalName") ?? "").trim() || publicName;
  const slug = slugifyTenantName(String(formData.get("slug") ?? "").trim() || publicName) || `church-${Date.now()}`;
  const now = new Date().toISOString();

  return {
    id: `tenant-${slug}`,
    legalName,
    publicName,
    slug,
    ...defaultTenantColors,
    country: String(formData.get("country") ?? "").trim() || "Kenya",
    region: String(formData.get("region") ?? "").trim() || "Unspecified region",
    physicalAddress: String(formData.get("physicalAddress") ?? "").trim() || "Not provided",
    contactEmail: String(formData.get("contactEmail") ?? "").trim() || `hello@${slug}.test`,
    contactPhone: String(formData.get("contactPhone") ?? "").trim() || "Not provided",
    timeZone: "Africa/Nairobi",
    defaultCurrency: "KES",
    defaultLanguage: "en",
    dateFormat: "dd MMM yyyy",
    timeFormat: "24h",
    membershipTerminology: String(formData.get("membershipTerminology") ?? "").trim() || "Member",
    branchTerminology: String(formData.get("branchTerminology") ?? "").trim() || "Branch",
    smallGroupTerminology: String(formData.get("smallGroupTerminology") ?? "").trim() || "Fellowship",
    ministryHeadTitle: String(formData.get("ministryHeadTitle") ?? "").trim() || "Senior Pastor",
    status,
    subscriptionStatus: status === "approved" ? "active" : "trialing",
    onboardingStatus: status === "draft" ? "draft" : "submitted",
    createdAt: now,
    updatedAt: now,
  } satisfies Tenant;
}

export function upsertDemoTenant(demoTenants: Tenant[], tenant: Tenant) {
  const withoutExisting = demoTenants.filter((item) => item.slug !== tenant.slug);
  return [tenant, ...withoutExisting].slice(0, 12);
}

export function updateDemoTenantStatus(demoTenants: Tenant[], slug: string, status: TenantStatus): Tenant[] {
  return demoTenants.map((tenant) =>
    tenant.slug === slug
      ? {
          ...tenant,
          status,
          onboardingStatus: status === "approved" ? "approved" : status,
          subscriptionStatus: status === "approved" ? "active" : tenant.subscriptionStatus,
          updatedAt: new Date().toISOString(),
        }
      : tenant,
  );
}

export function setDemoTenantStatus(demoTenants: Tenant[], tenant: Tenant, status: TenantStatus) {
  const updatedTenant: Tenant = {
    ...tenant,
    status,
    onboardingStatus: status === "approved" ? "approved" : status,
    subscriptionStatus: status === "approved" ? "active" : tenant.subscriptionStatus,
    updatedAt: new Date().toISOString(),
  };

  return upsertDemoTenant(demoTenants, updatedTenant);
}
