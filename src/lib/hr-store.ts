import "server-only";
import { getVisibleTenantBySlug } from "./tenant-store";
import { getWorkspaceAccess } from "./workspace-store";
import { getSupabaseAdmin } from "./supabase-admin";
import type { PayStaff, PaySnapshot } from "./hr-payroll";
export type Staff = PayStaff & {
  tenant_id: string;
  member_id: string;
  user_id: string | null;
  department_id: string | null;
  branch_id: string | null;
  supervisor_id: string | null;
  job_title: string;
  employment_type: string;
  status: string;
  payroll_eligible: boolean;
};
export type Review = {
  id: string;
  staff_id: string;
  title: string;
  cycle_type: string;
  period_start: string;
  period_end: string;
  goals: string;
  self_review: string;
  supervisor_review: string;
  rating: number | null;
  status: string;
  updated_at: string;
};
export type Period = {
  id: string;
  month: string;
  title: string;
  status: string;
  calculated_at: string | null;
  created_by: string;
  submitted_by: string | null;
  payment_reference: string | null;
  updated_at: string;
};
export async function hrAccess(slug: string) {
  const tenant = await getVisibleTenantBySlug(slug);
  const access =
    tenant?.status === "approved"
      ? await getWorkspaceAccess(tenant.id)
      : undefined;
  if (!tenant || !access) return undefined;
  return {
    tenant,
    ...access,
    admin: access.member.type === "church_admin",
    leader: access.member.type === "church_leader",
    finance: access.member.type === "finance_officer",
  };
}
export async function hrData(
  access: NonNullable<Awaited<ReturnType<typeof hrAccess>>>,
) {
  const client = getSupabaseAdmin();
  let query = client
    .from("kf_hr_staff")
    .select("*")
    .eq("tenant_id", access.tenant.id)
    .order("staff_no");
  if (!access.admin && !access.leader && !access.finance)
    query = query.eq("user_id", access.user.id);
  const { data, error } = await query;
  if (error)
    throw new Error(
      "Church HR database is not available. Please contact the platform administrator.",
    );
  const all = (data ?? []) as Staff[];
  const own = all.filter((s) => s.user_id === access.user.id);
  if (!access.admin && !access.leader && !access.finance && !own.length)
    return { staff: [], payrollStaff: [], reviews: [], periods: [] };
  const staff = access.admin
    ? all
    : access.leader
      ? all.filter(
          (s) =>
            s.supervisor_id === access.user.id || s.user_id === access.user.id,
        )
      : own;
  const reviewIds = staff.map((s) => s.id);
  const { data: reviews, error: reviewError } = reviewIds.length
    ? await client
        .from("kf_hr_reviews")
        .select("*")
        .eq("tenant_id", access.tenant.id)
        .in("staff_id", reviewIds)
        .order("created_at", { ascending: false })
    : { data: [], error: null };
  let periodsQuery = client
    .from("kf_hr_periods")
    .select("*")
    .eq("tenant_id", access.tenant.id)
    .order("month", { ascending: false });
  if (access.leader)
    periodsQuery = periodsQuery.in("status", ["Submitted", "Approved", "Paid"]);
  else if (access.finance)
    periodsQuery = periodsQuery.in("status", ["Approved", "Paid"]);
  else if (!access.admin) periodsQuery = periodsQuery.eq("status", "Paid");
  if (!access.admin && !access.leader && !access.finance) {
    const { data: ownItems, error: ownError } = await client
      .from("kf_hr_payroll_items")
      .select("period_id")
      .eq("tenant_id", access.tenant.id)
      .in(
        "staff_id",
        own.map((s) => s.id),
      );
    if (ownError) throw new Error("Payslip access could not be checked.");
    const ids = Array.from(new Set((ownItems ?? []).map((i) => i.period_id)));
    if (!ids.length)
      return {
        staff,
        payrollStaff: own,
        reviews: (reviews ?? []) as Review[],
        periods: [],
      };
    periodsQuery = periodsQuery.in("id", ids);
  }
  const { data: periods, error: periodError } = await periodsQuery;
  if (reviewError || periodError)
    throw new Error("HR records could not be loaded.");
  return {
    staff,
    payrollStaff: access.admin || access.leader || access.finance ? all : own,
    reviews: (reviews ?? []) as Review[],
    periods: (periods ?? []) as Period[],
  };
}
export async function payrollItems(
  access: NonNullable<Awaited<ReturnType<typeof hrAccess>>>,
  periodId: string,
) {
  const data = await hrData(access);
  if (!data.periods.some((p) => p.id === periodId))
    throw new Error("Payroll access denied.");
  let query = getSupabaseAdmin()
    .from("kf_hr_payroll_items")
    .select("id,staff_id,snapshot")
    .eq("tenant_id", access.tenant.id)
    .eq("period_id", periodId);
  if (!access.admin && !access.leader && !access.finance)
    query = query.in(
      "staff_id",
      data.staff.map((s) => s.id),
    );
  const { data: items, error } = await query;
  if (error) throw new Error("Payslips could not be loaded.");
  return (items ?? []) as {
    id: string;
    staff_id: string;
    snapshot: PaySnapshot;
  }[];
}
