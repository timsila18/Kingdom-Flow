import { cookies } from "next/headers";
import type { Tenant, TenantStatus } from "./types";
import { getSupabaseAdmin } from "./supabase-admin";
import { getCurrentUser } from "./app-auth";

export const registeredTenantsCookie = "kingdomflow_registered_tenants";
export const legacyDemoTenantsCookie = "kingdomflow_demo_tenants";

const defaultTenantColors = {
  primaryColor: "#2563eb",
  secondaryColor: "#f3f6fa",
  accentColor: "#18b7c9",
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

export function readRegisteredTenants(rawValue?: string | null): Tenant[] {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue) as Tenant[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (tenant) =>
        tenant &&
        typeof tenant.id === "string" &&
        typeof tenant.slug === "string" &&
        typeof tenant.publicName === "string",
    );
  } catch {
    return [];
  }
}

export function serializeRegisteredTenants(value: Tenant[]) {
  return JSON.stringify(value);
}

export function mergeTenants(registeredTenants: Tenant[]) {
  const bySlug = new Map<string, Tenant>();
  for (const tenant of registeredTenants) bySlug.set(tenant.slug, tenant);
  return [...bySlug.values()].sort((first, second) => {
    const firstPending = first.status === "under_review" ? 0 : 1;
    const secondPending = second.status === "under_review" ? 0 : 1;
    return (
      firstPending - secondPending ||
      second.createdAt.localeCompare(first.createdAt)
    );
  });
}

export async function getVisibleTenants() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("tenants")
    .select("*,tenant_settings(regional_settings)")
    .is("archived_at", null)
    .neq("slug", "kingdomflow-demo");
  if (error)
    throw new Error(
      "Church registrations could not be loaded. Please try again.",
    );
  const cookieStore = await cookies();
  const legacy = readRegisteredTenants(
    cookieStore.get(registeredTenantsCookie)?.value,
  );
  const tenants = (data ?? [])
    .filter(
      (row) =>
        user.isSuperAdmin ||
        row.tenant_settings?.regional_settings?.workspace?.team?.some(
          (member: { id: string }) => member.id === user.id,
        ),
    )
    .map((row) => {
      const saved = row.tenant_settings?.regional_settings?.registration;
      const old = legacy.find((item) => item.slug === row.slug);
      const base =
        saved ?? old ?? buildTenantFromRegistration(new FormData(), row.status);
      return {
        ...base,
        id: row.id,
        slug: row.slug,
        publicName: row.public_name,
        legalName: row.legal_name,
        status: row.status,
        region: row.region ?? "",
        country: row.country,
        contactEmail: row.email_addresses?.[0] ?? "",
        contactPhone: row.phone_numbers?.[0] ?? "",
        physicalAddress: row.physical_address ?? "",
        ministryHeadTitle: row.ministry_head_title,
        subscriptionStatus: row.subscription_status,
        updatedAt: row.updated_at,
        createdAt: row.created_at,
      } as Tenant;
    });
  return mergeTenants(tenants);
}

export async function getVisibleTenantBySlug(slug: string) {
  const visibleTenants = await getVisibleTenants();
  return visibleTenants.find((tenant) => tenant.slug === slug);
}

export function buildTenantFromRegistration(
  formData: FormData,
  status: TenantStatus,
) {
  const publicName =
    String(formData.get("publicName") ?? "").trim() || "Untitled Church";
  const legalName =
    String(formData.get("legalName") ?? "").trim() || publicName;
  const slug =
    slugifyTenantName(
      String(formData.get("slug") ?? "").trim() || publicName,
    ) || `church-${Date.now()}`;
  const now = new Date().toISOString();
  const departments = String(formData.get("departments") ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
  const programmes = String(formData.get("programmes") ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: crypto.randomUUID(),
    legalName,
    publicName,
    slug,
    ...defaultTenantColors,
    country: String(formData.get("country") ?? "").trim() || "Kenya",
    region: String(formData.get("region") ?? "").trim() || "Unspecified region",
    physicalAddress:
      String(formData.get("physicalAddress") ?? "").trim() || "Not provided",
    contactEmail:
      String(formData.get("contactEmail") ?? "").trim() || "Not provided",
    contactPhone:
      String(formData.get("contactPhone") ?? "").trim() || "Not provided",
    timeZone: "Africa/Nairobi",
    defaultCurrency: "KES",
    defaultLanguage: "en",
    dateFormat: "dd MMM yyyy",
    timeFormat: "24h",
    membershipTerminology:
      String(formData.get("membershipTerminology") ?? "").trim() || "Member",
    branchTerminology:
      String(formData.get("branchTerminology") ?? "").trim() || "Branch",
    smallGroupTerminology:
      String(formData.get("smallGroupTerminology") ?? "").trim() ||
      "Fellowship",
    ministryHeadTitle:
      String(formData.get("ministryHeadTitle") ?? "").trim() || "Church Leader",
    status,
    subscriptionStatus: status === "approved" ? "active" : "trialing",
    onboardingStatus: status === "draft" ? "draft" : "submitted",
    onboardingProfile: {
      churchType:
        String(formData.get("churchType") ?? "").trim() || "Independent church",
      denominationOrNetwork: String(
        formData.get("denominationOrNetwork") ?? "",
      ).trim(),
      foundingYear: String(formData.get("foundingYear") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
      principalLeaderName:
        String(formData.get("principalLeaderName") ?? "").trim() ||
        "Not provided",
      principalLeaderEmail:
        String(formData.get("principalLeaderEmail") ?? "").trim() ||
        "Not provided",
      principalLeaderPhone:
        String(formData.get("principalLeaderPhone") ?? "").trim() ||
        "Not provided",
      governanceModel:
        String(formData.get("governanceModel") ?? "").trim() ||
        "Senior pastor led",
      approvalModel:
        String(formData.get("approvalModel") ?? "").trim() ||
        "Two-person approval for sensitive actions",
      estimatedMembers:
        String(formData.get("estimatedMembers") ?? "").trim() || "Not provided",
      averageAttendance:
        String(formData.get("averageAttendance") ?? "").trim() ||
        "Not provided",
      branchesPlanned:
        String(formData.get("branchesPlanned") ?? "").trim() || "1",
      subscriptionTier:
        String(formData.get("subscriptionTier") ?? "").trim() || "Starter",
      brandTone:
        String(formData.get("brandTone") ?? "").trim() ||
        "Warm, dignified and modern",
      logoStatus:
        String(formData.get("logoStatus") ?? "").trim() ||
        "Use default KingdomFlow mark until uploaded",
      primaryServiceDay:
        String(formData.get("primaryServiceDay") ?? "").trim() || "Sunday",
      departments,
      programmes,
      firstBranchName:
        String(formData.get("firstBranchName") ?? "").trim() || "Main Branch",
      firstBranchLocation:
        String(formData.get("firstBranchLocation") ?? "").trim() ||
        String(formData.get("physicalAddress") ?? "").trim() ||
        "Not provided",
      declarations: [
        "Authorized representative",
        "Church controls its ministry data",
        "KingdomFlow is technology infrastructure, not spiritual authority",
      ],
    },
    createdAt: now,
    updatedAt: now,
  } satisfies Tenant;
}

export async function saveChurchRegistration(tenant: Tenant) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in before registering a church.");
  const client = getSupabaseAdmin();
  const { error: profileError } = await client
    .from("profiles")
    .upsert({ id: user.id, email: user.email, full_name: user.name });
  if (profileError) throw new Error("Your account profile could not be saved.");
  const { error } = await client
    .from("tenants")
    .insert({
      id: tenant.id,
      public_name: tenant.publicName,
      legal_name: tenant.legalName,
      slug: tenant.slug,
      country: tenant.country,
      region: tenant.region,
      physical_address: tenant.physicalAddress,
      email_addresses: [tenant.contactEmail],
      phone_numbers: [tenant.contactPhone],
      ministry_head_title: tenant.ministryHeadTitle,
      branch_terminology: tenant.branchTerminology,
      small_group_terminology: tenant.smallGroupTerminology,
      status: tenant.status,
      onboarding_status: tenant.status,
      primary_color: tenant.primaryColor,
      secondary_color: tenant.secondaryColor,
      accent_color: tenant.accentColor,
    });
  if (error)
    throw new Error(
      error.code === "23505"
        ? "That church address is already in use. Choose another name or address."
        : "Church registration could not be saved.",
    );
  const records = [
    ...(tenant.onboardingProfile?.departments ?? []).map((name) => ({
      id: crypto.randomUUID(),
      kind: "departments",
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      fields: { name },
    })),
    ...(tenant.onboardingProfile?.programmes ?? []).map((name) => ({
      id: crypto.randomUUID(),
      kind: "classes",
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      fields: { name, published: "no" },
    })),
  ];
  const { error: settingsError } = await client
    .from("tenant_settings")
    .insert({
      tenant_id: tenant.id,
      regional_settings: {
        registration: tenant,
        workspace: {
          team: [
            {
              id: user.id,
              email: user.email,
              name: user.name,
              type: "church_admin",
              title: "",
              personId: "",
              assignedIds: [],
            },
          ],
          records,
        },
      },
    });
  if (settingsError) {
    await client.from("tenants").delete().eq("id", tenant.id);
    throw new Error("Church setup could not be saved. Please try again.");
  }
  await client
    .from("audit_logs")
    .insert({
      tenant_id: tenant.id,
      actor_id: user.id,
      action: "church.registered",
      entity_type: "tenant",
      entity_id: tenant.id,
      result: "success",
    });
}

export async function changeChurchStatus(
  slug: string,
  status: TenantStatus,
  reason: string,
) {
  const user = await getCurrentUser();
  if (!user?.isSuperAdmin)
    throw new Error("Only the platform administrator can approve churches.");
  const { error } = await getSupabaseAdmin()
    .from("tenants")
    .update({
      status,
      onboarding_status: status,
      ...(status === "approved" ? { subscription_status: "active" } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug);
  if (error) throw new Error("The church decision could not be saved.");
  // Keep review reasons outside confidential church records.
  const tenant = await getVisibleTenantBySlug(slug);
  if (tenant) {
    await getSupabaseAdmin()
      .from("audit_logs")
      .insert({
        tenant_id: tenant.id,
        actor_id: user.id,
        action: `church.${status}`,
        entity_type: "tenant",
        entity_id: tenant.id,
        result: "success",
        reason,
      });
    const { data } = await getSupabaseAdmin()
      .from("tenant_settings")
      .select("security_settings")
      .eq("tenant_id", tenant.id)
      .single();
    await getSupabaseAdmin()
      .from("tenant_settings")
      .update({
        security_settings: {
          ...data?.security_settings,
          lastReview: {
            status,
            reason,
            reviewedBy: user.id,
            at: new Date().toISOString(),
          },
        },
      })
      .eq("tenant_id", tenant.id);
  }
}

export function upsertRegisteredTenant(
  registeredTenants: Tenant[],
  tenant: Tenant,
) {
  const withoutExisting = registeredTenants.filter(
    (item) => item.slug !== tenant.slug,
  );
  return [tenant, ...withoutExisting].slice(0, 12);
}

export function updateRegisteredTenantStatus(
  registeredTenants: Tenant[],
  slug: string,
  status: TenantStatus,
): Tenant[] {
  return registeredTenants.map((tenant) =>
    tenant.slug === slug
      ? {
          ...tenant,
          status,
          onboardingStatus: status === "approved" ? "approved" : status,
          subscriptionStatus:
            status === "approved" ? "active" : tenant.subscriptionStatus,
          updatedAt: new Date().toISOString(),
        }
      : tenant,
  );
}

export function setRegisteredTenantStatus(
  registeredTenants: Tenant[],
  tenant: Tenant,
  status: TenantStatus,
) {
  const updatedTenant: Tenant = {
    ...tenant,
    status,
    onboardingStatus: status === "approved" ? "approved" : status,
    subscriptionStatus:
      status === "approved" ? "active" : tenant.subscriptionStatus,
    updatedAt: new Date().toISOString(),
  };

  return upsertRegisteredTenant(registeredTenants, updatedTenant);
}
