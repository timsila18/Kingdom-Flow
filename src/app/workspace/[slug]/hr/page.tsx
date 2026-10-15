import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/shells";
import { hrAccess, hrData, payrollItems } from "@/lib/hr-store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  Plus,
  Save,
  Check,
  Calculator,
  Send,
  Download,
  CalendarDays,
  FileText,
  UserRound,
  WalletCards,
  ClipboardList,
  Target,
  Bell,
} from "lucide-react";
import type { ReactNode } from "react";
import { teamMemberName } from "@/lib/team-label";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white";
const amount = (value: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    value,
  );
const asRecord = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
function reviewText(value: string, key: string, fallback = "Not provided") {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed?.[key] === "string" && parsed[key].trim()
      ? parsed[key]
      : fallback;
  } catch {
    return value?.trim() || fallback;
  }
}
const requestDetail = (value: unknown, key: string) => {
  const detail = asRecord(value)[key];
  return detail == null ? "" : String(detail);
};
function Field({
  name,
  label,
  type = "text",
  value = "",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  value?: string | number;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        step={type === "number" ? "0.01" : undefined}
        min={
          name === "rating"
            ? "1"
            : type === "month"
              ? "2026-02"
              : type === "number"
                ? "0"
                : undefined
        }
        max={name === "rating" ? "5" : type === "month" ? "2026-12" : undefined}
      />
    </label>
  );
}
function Select({
  name,
  label,
  value,
  options,
  required = false,
}: {
  name: string;
  label: string;
  value?: string | null;
  options: { id: string; name: string }[];
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select name={name} defaultValue={value ?? ""} required={required}>
        <option value="">Choose</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}
function Form({
  endpoint,
  action,
  tab,
  children,
  id,
  periodId,
}: {
  endpoint: string;
  action: string;
  tab: string;
  children: ReactNode;
  id?: string;
  periodId?: string;
}) {
  return (
    <form action={endpoint} method="post" className="grid gap-4">
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="section" value={tab} />
      {id && <input type="hidden" name="id" value={id} />}
      {periodId && <input type="hidden" name="periodId" value={periodId} />}
      {children}
    </form>
  );
}
export default async function ChurchHR({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params,
    search = await searchParams;
  const access = await hrAccess(slug);
  if (!access) notFound();
  const data = await hrData(access),
    base = `/workspace/${slug}/hr`,
    endpoint = `${base}/actions`;
  const ownStaff = data.staff.find((s) => s.user_id === access.user.id);
  const allowedTabs = access.finance
    ? data.staff.some((s) => s.user_id === access.user.id)
      ? ["self-service", "performance", "payroll"]
      : ["payroll"]
    : access.admin
      ? ["staff", "self-service", "performance", "payroll"]
      : ["self-service", "performance", "payroll"];
  const tab = allowedTabs.includes(search.tab ?? "")
    ? search.tab!
    : access.finance
      ? ownStaff
        ? "self-service"
        : "payroll"
      : access.admin
        ? "staff"
        : "self-service";
  const people = access.workspace.records.filter(
    (r) => r.kind === "people" && r.fields.archived !== "yes",
  );
  const confirmed = people.filter(
    (r) => r.fields.stage === "Member" && r.fields.membershipConfirmedBy,
  );
  const edit = access.admin
    ? data.staff.find((s) => s.id === search.edit)
    : undefined;
  const profile = data.staff.find((s) => s.id === search.staff) ?? ownStaff;
  const essViews = [
    "home",
    "leave",
    "payslips",
    "p9",
    "documents",
    "profile",
    "performance",
    "requests",
  ];
  const essView = essViews.includes(search.view ?? "") ? search.view! : "home";
  const options = (kind: string) =>
    access.workspace.records
      .filter((r) => r.kind === kind && r.fields.archived !== "yes")
      .map((r) => ({
        id: r.id,
        name: r.fields.name ?? r.fields.title ?? kind,
      }));
  const period =
    data.periods.find((p) => p.id === search.period) ?? data.periods[0];
  const items = period ? await payrollItems(access, period.id) : [];
  const client = getSupabaseAdmin();
  const { data: inputs } =
    access.admin && period
      ? await client
          .from("kf_hr_inputs")
          .select("*")
          .eq("tenant_id", access.tenant.id)
          .eq("period_id", period.id)
      : { data: [] };
  const { data: events } =
    profile && (access.admin || profile.user_id === access.user.id)
      ? await client
          .from("kf_hr_events")
          .select("*")
          .eq("tenant_id", access.tenant.id)
          .eq("staff_id", profile.id)
          .order("effective_date", { ascending: false })
      : { data: [] };
  const documentsQuery =
    profile && (access.admin || profile.user_id === access.user.id)
      ? client
          .from("kf_hr_documents")
          .select("id,title,file_name,visibility,created_at")
          .eq("tenant_id", access.tenant.id)
          .eq("staff_id", profile.id)
      : null;
  const { data: documents } = documentsQuery
    ? await (access.admin
        ? documentsQuery
        : documentsQuery.eq("visibility", "Employee visible"))
    : { data: [] };
  const { data: audit } = access.admin
    ? await client
        .from("kf_hr_audit")
        .select("id,action,actor_id,created_at")
        .eq("tenant_id", access.tenant.id)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [] };
  const { data: requests } = ownStaff
    ? await client
        .from("kf_hr_requests")
        .select(
          "id,request_type,subject,details,status,submitted_at,decision_note",
        )
        .eq("tenant_id", access.tenant.id)
        .eq("staff_id", ownStaff.id)
        .order("submitted_at", { ascending: false })
        .limit(50)
    : { data: [] };
  const { data: adminRequests } = access.admin
    ? await client
        .from("kf_hr_requests")
        .select(
          "id,staff_id,request_type,subject,details,status,submitted_at,decision_note",
        )
        .eq("tenant_id", access.tenant.id)
        .in("status", ["Pending", "Returned"])
        .order("submitted_at", { ascending: true })
        .limit(100)
    : { data: [] };
  const { data: ownPayrollItems } = ownStaff
    ? await client
        .from("kf_hr_payroll_items")
        .select("id,period_id,snapshot")
        .eq("tenant_id", access.tenant.id)
        .eq("staff_id", ownStaff.id)
    : { data: [] };
  const ownPayslips = (ownPayrollItems ?? [])
    .map((item) => ({
      ...item,
      period: data.periods.find((candidate) => candidate.id === item.period_id),
    }))
    .filter((item) => item.period?.status === "Paid")
    .sort((left, right) =>
      String(right.period?.month).localeCompare(String(left.period?.month)),
    );
  const p9Years = Array.from(
    new Set(
      ownPayslips.map((item) => item.period?.month.slice(0, 4)).filter(Boolean),
    ),
  ) as string[];
  return (
    <WorkspaceShell tenantName={access.tenant.publicName} tenantSlug={slug}>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Church HR</h1>
        <p className="mt-2 text-muted">
          {access.admin
            ? "Staff, performance and monthly payroll"
            : access.finance
              ? "Approved payroll and payment records"
              : access.leader
                ? "Staff reviews and payroll approvals"
                : "My reviews and payslips"}
        </p>
      </header>
      {search.error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 p-4 text-red-800"
        >
          {search.error}
        </p>
      )}
      {search.success && (
        <p
          role="status"
          className="mb-4 rounded-md border border-green-300 bg-green-50 p-4 text-green-800"
        >
          {search.success}
        </p>
      )}
      <nav className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {allowedTabs.map((t) => (
          <Link
            key={t}
            href={`${base}?tab=${t}`}
            className={`rounded-md px-4 py-3 text-sm font-semibold ${tab === t ? "bg-primary text-white" : "text-primary"}`}
          >
            {t === "staff"
              ? "Staff"
              : t === "self-service"
                ? "My ESS"
                : t === "performance"
                  ? "Performance"
                  : "Payroll"}
          </Link>
        ))}
      </nav>
      {tab === "staff" && access.admin && (
        <div className="grid gap-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Staff register ({data.staff.length})
            </h2>
            <div className="flex gap-3">
              <Link href={`${base}?tab=staff&new=yes`} className={button}>
                <Plus size={18} />
                Add staff
              </Link>
              <Link
                href={`${base}/export?report=staff&format=xlsx`}
                className="flex items-center gap-2 text-primary"
              >
                <Download size={18} />
                Excel
              </Link>
              <Link
                href={`${base}/export?report=staff&format=pdf`}
                className="flex items-center gap-2 text-primary"
              >
                <Download size={18} />
                PDF
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  {[
                    "Staff no.",
                    "Name",
                    "Job",
                    "Type",
                    "Status",
                    "Salary",
                    "",
                  ].map((h) => (
                    <th key={h} className="border-b border-border p-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.staff.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3">{s.staff_no}</td>
                    <td className="p-3">
                      <Link
                        className="text-primary"
                        href={`${base}?tab=staff&staff=${s.id}`}
                      >
                        {s.name}
                      </Link>
                    </td>
                    <td className="p-3">{s.job_title}</td>
                    <td className="p-3">{s.employment_type}</td>
                    <td className="p-3">{s.status}</td>
                    <td className="p-3">{amount(s.basic_salary)}</td>
                    <td className="p-3">
                      <Link
                        className="text-primary"
                        href={`${base}?tab=staff&edit=${s.id}`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.staff.length && (
              <p className="py-6 text-muted">No staff added yet.</p>
            )}
          </div>
          {search.new && !confirmed.length && (
            <p className="text-muted">No confirmed church members yet.</p>
          )}
          {(search.new || edit) && confirmed.length > 0 && (
            <section className="border-t border-border pt-6">
              <h2 className="mb-4 text-lg font-semibold">
                {edit ? "Edit staff" : "Add staff from church members"}
              </h2>
              <Form
                endpoint={endpoint}
                action="save-staff"
                tab="staff"
                id={edit?.id}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Select
                    name="memberId"
                    label="Confirmed church member"
                    required
                    value={edit?.member_id ?? search.memberId}
                    options={confirmed.map((p) => ({
                      id: p.id,
                      name: p.fields.name,
                    }))}
                  />
                  <Field
                    name="staffNo"
                    label="Staff number"
                    required
                    value={edit?.staff_no}
                  />
                  <Field
                    name="jobTitle"
                    label="Job title"
                    required
                    value={edit?.job_title}
                  />
                  <Select
                    name="employmentType"
                    label="Employment type"
                    required
                    value={edit?.employment_type ?? "Employee"}
                    options={["Employee", "Stipend worker", "Volunteer"].map(
                      (id) => ({ id, name: id }),
                    )}
                  />
                  <Select
                    name="status"
                    label="Employment status"
                    required
                    value={edit?.status ?? "Active"}
                    options={["Active", "On leave", "Suspended", "Exited"].map(
                      (id) => ({ id, name: id }),
                    )}
                  />
                  <Select
                    name="departmentId"
                    label="Department"
                    value={edit?.department_id}
                    options={options("departments")}
                  />
                  <Select
                    name="branchId"
                    label="Branch"
                    value={edit?.branch_id}
                    options={options("branches")}
                  />
                  <Select
                    name="supervisorId"
                    label="Supervisor"
                    value={edit?.supervisor_id}
                    options={access.workspace.team
                      .filter((m) =>
                        [m.type, ...(m.types ?? [])].some(
                          (t) => t === "church_leader" || t === "church_admin",
                        ),
                      )
                      .map((m) => ({ id: m.id, name: teamMemberName(m) }))}
                  />
                  <Field
                    name="startDate"
                    label="Start date"
                    type="date"
                    required
                    value={edit?.start_date}
                  />
                  <Field
                    name="endDate"
                    label="Contract / exit date"
                    type="date"
                    value={edit?.end_date ?? ""}
                  />
                  <Field
                    name="salary"
                    label="Monthly basic salary (KES)"
                    type="number"
                    required
                    value={edit?.basic_salary ?? 0}
                  />
                  <Select
                    name="resident"
                    label="Kenyan tax resident"
                    value={edit?.details.resident === false ? "no" : "yes"}
                    options={[
                      { id: "yes", name: "Yes" },
                      { id: "no", name: "No" },
                    ]}
                  />
                  <Field
                    name="kraPin"
                    label="KRA PIN"
                    value={edit?.details.kraPin}
                  />
                  <Field
                    name="nationalId"
                    label="National ID"
                    value={edit?.details.nationalId}
                  />
                  <Field
                    name="nssfNo"
                    label="NSSF number"
                    value={edit?.details.nssfNo}
                  />
                  <Field
                    name="shaNo"
                    label="SHA number"
                    value={edit?.details.shaNo}
                  />
                  <Field
                    name="bank"
                    label="Bank name"
                    value={edit?.details.bank}
                  />
                  <Field
                    name="account"
                    label="Bank account"
                    value={edit?.details.account}
                  />
                  <Field
                    name="emergencyContact"
                    label="Emergency contact"
                    value={String(
                      (edit?.details as Record<string, unknown>)
                        ?.emergencyContact ?? "",
                    )}
                  />
                  <Field
                    name="contractNotes"
                    label="Contract notes"
                    value={String(
                      (edit?.details as Record<string, unknown>)
                        ?.contractNotes ?? "",
                    )}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    name="payrollEligible"
                    type="checkbox"
                    defaultChecked={edit?.payroll_eligible}
                  />
                  Include in payroll
                </label>
                <div className="flex gap-3">
                  <button className={button}>
                    <Save size={18} />
                    Save staff
                  </button>
                  <Link
                    className="self-center text-primary"
                    href={`${base}?tab=staff`}
                  >
                    Cancel
                  </Link>
                </div>
              </Form>
            </section>
          )}
          <details
            className="border-t border-border pt-5"
            open={Boolean(search.new && !confirmed.length)}
          >
            <summary className="cursor-pointer font-semibold">
              Confirm church membership
            </summary>
            <div className="mt-4 max-w-lg">
              <Form endpoint={endpoint} action="confirm-member" tab="staff">
                <Select
                  name="memberId"
                  label="Church person"
                  required
                  options={people
                    .filter((p) => !p.fields.membershipConfirmedBy)
                    .map((p) => ({ id: p.id, name: p.fields.name }))}
                />
                <button className={button}>
                  <Check size={18} />
                  Confirm as member
                </button>
              </Form>
            </div>
          </details>
          {profile && (
            <section className="border-t border-border pt-6">
              <h2 className="mb-4 text-lg font-semibold">
                {profile.name} - staff history
              </h2>
              {events?.map((e) => (
                <div key={e.id} className="border-b border-border py-3">
                  <strong>{e.kind}</strong> · {e.effective_date}
                  <p className="mt-1 whitespace-pre-wrap">{e.note}</p>
                </div>
              ))}
              <div className="mt-5 max-w-xl">
                <Form endpoint={endpoint} action="staff-event" tab="staff">
                  <input type="hidden" name="staffId" value={profile.id} />
                  <Select
                    name="kind"
                    label="Action"
                    required
                    options={[
                      "Contract",
                      "Confirmation",
                      "Promotion",
                      "Transfer",
                      "Disciplinary",
                      "Renewal",
                      "Offboarding",
                    ].map((id) => ({ id, name: id }))}
                  />
                  <Field
                    name="date"
                    label="Effective date"
                    type="date"
                    required
                  />
                  <label className="grid gap-2 text-sm">
                    Notes
                    <textarea name="note" required maxLength={5000} />
                  </label>
                  <button className={button}>
                    <Save size={18} />
                    Save history entry
                  </button>
                </Form>
              </div>
            </section>
          )}
          <section className="border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <Bell size={19} className="text-primary" />
              <h2 className="text-lg font-semibold">
                ESS requests awaiting action
              </h2>
            </div>
            <div className="mt-4 grid gap-4">
              {(adminRequests ?? []).map((request) => {
                const staff = data.staff.find(
                  (item) => item.id === request.staff_id,
                );
                return (
                  <div
                    key={request.id}
                    className="rounded-md border border-border p-5"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <strong>{request.subject}</strong>
                      <span className="text-sm text-muted">
                        {request.request_type} · {request.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">
                      {staff?.name ?? "Unknown staff"} ·{" "}
                      {requestDetail(request.details, "message")}
                    </p>
                    {request.request_type === "Leave" && (
                      <p className="mt-1 text-sm text-muted">
                        {requestDetail(request.details, "leaveType")} ·{" "}
                        {requestDetail(request.details, "startDate")} to{" "}
                        {requestDetail(request.details, "endDate")}
                      </p>
                    )}
                    {request.request_type === "Profile change" && (
                      <p className="mt-1 text-sm text-muted">
                        Change {requestDetail(request.details, "fieldName")} to{" "}
                        {requestDetail(request.details, "newValue")}
                      </p>
                    )}
                    <Form
                      endpoint={endpoint}
                      action="decide-ess-request"
                      tab="staff"
                      id={request.id}
                    >
                      <label className="grid gap-2 text-sm font-medium">
                        Decision note
                        <textarea
                          name="decisionNote"
                          required
                          maxLength={2000}
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={button}
                          name="decision"
                          value="Approved"
                        >
                          <Check size={17} /> Approve
                        </button>
                        <button
                          className="rounded-md border border-border px-4 py-2 text-sm font-semibold"
                          name="decision"
                          value="Returned"
                        >
                          Return
                        </button>
                        <button
                          className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
                          name="decision"
                          value="Rejected"
                        >
                          Reject
                        </button>
                      </div>
                    </Form>
                  </div>
                );
              })}
              {!adminRequests?.length && (
                <p className="text-muted">No ESS requests are waiting.</p>
              )}
            </div>
          </section>
        </div>
      )}
      {tab === "performance" && (
        <div className="grid gap-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Total reviews", data.reviews.length],
              [
                "Awaiting self-review",
                data.reviews.filter((r) => r.status === "Draft").length,
              ],
              [
                "Awaiting supervisor",
                data.reviews.filter((r) => r.status === "Self submitted")
                  .length,
              ],
              [
                "Finalised",
                data.reviews.filter((r) => r.status === "Finalised").length,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-md border border-border bg-surface p-4"
              >
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </section>
          {access.admin && (
            <details>
              <summary className="cursor-pointer font-semibold">
                Create performance review
              </summary>
              <div className="mt-4 max-w-xl">
                <Form
                  endpoint={endpoint}
                  action="create-review"
                  tab="performance"
                >
                  <Select
                    name="staffId"
                    label="Staff member"
                    required
                    options={data.staff
                      .filter((s) => s.status !== "Exited")
                      .map((s) => ({ id: s.id, name: s.name }))}
                  />
                  <Field name="title" label="Review title" required />
                  <Select
                    name="cycleType"
                    label="Cycle"
                    required
                    options={[
                      "Quarterly",
                      "Annual",
                      "Mid-year",
                      "Probation",
                      "Custom",
                    ].map((id) => ({ id, name: id }))}
                  />
                  <Field
                    name="startDate"
                    label="Start date"
                    type="date"
                    required
                  />
                  <Field name="endDate" label="End date" type="date" required />
                  <label className="grid gap-2 text-sm">
                    Work goals and KPIs
                    <textarea name="goals" required maxLength={10000} />
                  </label>
                  <button className={button}>
                    <Plus size={18} />
                    Create review
                  </button>
                </Form>
              </div>
            </details>
          )}
          {access.admin && (
            <div className="flex gap-4">
              <Link
                className="text-primary"
                href={`${base}/export?report=performance&format=pdf`}
              >
                PDF report
              </Link>
              <Link
                className="text-primary"
                href={`${base}/export?report=performance&format=xlsx`}
              >
                Excel report
              </Link>
            </div>
          )}
          {!data.reviews.length && (
            <p className="py-6 text-muted">No performance reviews yet.</p>
          )}
          {data.reviews.map((r) => {
            const staff = data.staff.find((s) => s.id === r.staff_id);
            return (
              <section key={r.id} className="border-t border-border pt-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <h2 className="text-lg font-semibold">
                    {r.title} - {staff?.name}
                  </h2>
                  <span className="text-sm text-muted">{r.status}</span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {r.cycle_type} · {r.period_start} to {r.period_end}
                </p>
                <p className="mt-3 whitespace-pre-wrap">{r.goals}</p>
                {r.self_review && (
                  <div className="mt-4 grid gap-3 rounded-md border border-border p-4 md:grid-cols-3">
                    <p>
                      <strong>What went well</strong>
                      <br />
                      {reviewText(r.self_review, "whatWentWell")}
                    </p>
                    <p>
                      <strong>Challenges</strong>
                      <br />
                      {reviewText(r.self_review, "challenges")}
                    </p>
                    <p>
                      <strong>Support needed</strong>
                      <br />
                      {reviewText(r.self_review, "supportNeeded")}
                    </p>
                  </div>
                )}
                {r.supervisor_review && (
                  <div className="mt-4 grid gap-3 rounded-md border border-border p-4 md:grid-cols-3">
                    <p>
                      <strong>Strengths</strong>
                      <br />
                      {reviewText(r.supervisor_review, "strengths")}
                    </p>
                    <p>
                      <strong>Development areas</strong>
                      <br />
                      {reviewText(r.supervisor_review, "developmentAreas")}
                    </p>
                    <p>
                      <strong>Next steps</strong>
                      <br />
                      {reviewText(r.supervisor_review, "nextSteps")}
                      <br />
                      <span className="text-muted">Rating {r.rating}/5</span>
                    </p>
                  </div>
                )}
                {staff?.user_id === access.user.id &&
                  ["Draft", "Self submitted"].includes(r.status) && (
                    <div className="mt-4 max-w-xl">
                      <Form
                        endpoint={endpoint}
                        action="self-review"
                        tab="performance"
                        id={r.id}
                      >
                        <label className="grid gap-2 text-sm">
                          What went well during this period?
                          <textarea
                            name="whatWentWell"
                            required
                            defaultValue={reviewText(
                              r.self_review,
                              "whatWentWell",
                              "",
                            )}
                          />
                        </label>
                        <label className="grid gap-2 text-sm">
                          What challenges did you face?
                          <textarea
                            name="challenges"
                            required
                            defaultValue={reviewText(
                              r.self_review,
                              "challenges",
                              "",
                            )}
                          />
                        </label>
                        <label className="grid gap-2 text-sm">
                          What support or training would help you perform
                          better?
                          <textarea
                            name="supportNeeded"
                            required
                            defaultValue={reviewText(
                              r.self_review,
                              "supportNeeded",
                              "",
                            )}
                          />
                        </label>
                        <button className={button}>
                          <Send size={18} />
                          Submit my review
                        </button>
                      </Form>
                    </div>
                  )}
                {(access.admin ||
                  (staff?.supervisor_id === access.user.id && access.leader)) &&
                  staff?.user_id !== access.user.id &&
                  ["Self submitted", "Supervisor reviewed"].includes(
                    r.status,
                  ) && (
                    <div className="mt-4 max-w-xl">
                      <Form
                        endpoint={endpoint}
                        action="supervisor-review"
                        tab="performance"
                        id={r.id}
                      >
                        <label className="grid gap-2 text-sm">
                          Strengths demonstrated
                          <textarea
                            name="strengths"
                            required
                            defaultValue={reviewText(
                              r.supervisor_review,
                              "strengths",
                              "",
                            )}
                          />
                        </label>
                        <label className="grid gap-2 text-sm">
                          Development areas
                          <textarea
                            name="developmentAreas"
                            required
                            defaultValue={reviewText(
                              r.supervisor_review,
                              "developmentAreas",
                              "",
                            )}
                          />
                        </label>
                        <label className="grid gap-2 text-sm">
                          Agreed next steps
                          <textarea
                            name="nextSteps"
                            required
                            defaultValue={reviewText(
                              r.supervisor_review,
                              "nextSteps",
                              "",
                            )}
                          />
                        </label>
                        <Field
                          name="rating"
                          label="Job performance rating (1-5)"
                          type="number"
                          required
                          value={r.rating ?? ""}
                        />
                        <button className={button}>
                          <Save size={18} />
                          Save supervisor review
                        </button>
                      </Form>
                    </div>
                  )}
                {access.admin && r.status === "Supervisor reviewed" && (
                  <div className="mt-4">
                    <Form
                      endpoint={endpoint}
                      action="finalise-review"
                      tab="performance"
                      id={r.id}
                    >
                      <button className={button}>
                        <Check size={18} />
                        Finalise review
                      </button>
                    </Form>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
      {tab === "self-service" && !ownStaff && (
        <section className="rounded-md border border-border p-6">
          <h2 className="text-lg font-semibold">ESS account not linked</h2>
          <p className="mt-2 text-muted">A church administrator must first add your confirmed member profile to the staff register and link it to this login.</p>
        </section>
      )}
      {tab === "self-service" && ownStaff && (
        <div className="grid gap-6">
          <nav className="flex gap-2 overflow-x-auto border-b border-border pb-3">
            {[
              ["home", "Dashboard"],
              ["leave", "My Leave"],
              ["payslips", "Payslips"],
              ["p9", "P9 Forms"],
              ["documents", "Documents"],
              ["profile", "Profile"],
              ["performance", "Performance"],
              ["requests", "Requests"],
            ].map(([key, label]) => (
              <Link
                key={key}
                href={`${base}?tab=self-service&view=${key}`}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${essView === key ? "bg-primary text-white" : "border border-border"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          {essView === "home" && (
            <>
              <section className="border-b border-border pb-6">
                <p className="text-sm font-semibold text-primary">
                  EMPLOYEE SELF SERVICE
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Welcome, {ownStaff.name}
                </h2>
                <p className="mt-2 text-muted">
                  Your pay, leave, documents, profile, requests and reviews in
                  one private workspace.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Staff number", ownStaff.staff_no],
                    ["Job title", ownStaff.job_title],
                    [
                      "Department",
                      access.workspace.records.find(
                        (r) => r.id === ownStaff.department_id,
                      )?.fields.name ?? "Unassigned",
                    ],
                    [
                      "Supervisor",
                      access.workspace.team.find(
                        (m) => m.id === ownStaff.supervisor_id,
                      )?.name ?? "Not assigned",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-md border border-border p-4"
                    >
                      <p className="text-xs text-muted">{label}</p>
                      <p className="mt-2 font-semibold">
                        {value || "Not assigned"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    key: "payslips",
                    label: "Payslips",
                    detail: `${ownPayslips.length} issued`,
                    Icon: WalletCards,
                  },
                  {
                    key: "leave",
                    label: "Leave",
                    detail: `${(requests ?? []).filter((r) => r.request_type === "Leave" && r.status === "Pending").length} pending`,
                    Icon: CalendarDays,
                  },
                  {
                    key: "documents",
                    label: "Documents",
                    detail: `${documents?.length ?? 0} available`,
                    Icon: FileText,
                  },
                  {
                    key: "performance",
                    label: "Performance",
                    detail: `${data.reviews.filter((r) => r.staff_id === ownStaff.id && r.status !== "Finalised").length} active`,
                    Icon: Target,
                  },
                  {
                    key: "requests",
                    label: "Requests",
                    detail: `${(requests ?? []).filter((r) => r.status === "Pending").length} pending`,
                    Icon: ClipboardList,
                  },
                  {
                    key: "profile",
                    label: "My profile",
                    detail: ownStaff.status,
                    Icon: UserRound,
                  },
                ].map(({ key, label, detail, Icon }) => (
                  <Link
                    key={key}
                    href={`${base}?tab=self-service&view=${key}`}
                    className="rounded-md border border-border p-5 transition hover:border-primary"
                  >
                    <Icon size={20} className="text-primary" />
                    <p className="mt-3 font-semibold">{label}</p>
                    <p className="mt-1 text-sm text-muted">{detail}</p>
                  </Link>
                ))}
              </section>
              <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-border p-5">
                  <h3 className="font-semibold">Recent requests</h3>
                  {(requests ?? []).slice(0, 4).map((r) => (
                    <p
                      key={r.id}
                      className="mt-3 border-t border-border pt-3 text-sm"
                    >
                      <strong>{r.subject}</strong>
                      <br />
                      <span className="text-muted">
                        {r.request_type} · {r.status}
                      </span>
                    </p>
                  ))}
                  {!requests?.length && (
                    <p className="mt-3 text-sm text-muted">No requests yet.</p>
                  )}
                </div>
                <div className="rounded-md border border-border p-5">
                  <h3 className="font-semibold">Recent documents</h3>
                  {(documents ?? []).slice(0, 4).map((document) => (
                    <p
                      key={document.id}
                      className="mt-3 border-t border-border pt-3 text-sm"
                    >
                      <strong>{document.title}</strong>
                      <br />
                      <Link
                        className="text-primary"
                        href={`${base}/documents?id=${document.id}`}
                      >
                        Download {document.file_name}
                      </Link>
                    </p>
                  ))}
                  {!documents?.length && (
                    <p className="mt-3 text-sm text-muted">
                      No employee-visible documents yet.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}
          {essView === "leave" && (
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-md border border-border p-5">
                <h2 className="text-lg font-semibold">Apply for leave</h2>
                <Form
                  endpoint={endpoint}
                  action="create-ess-request"
                  tab="self-service"
                >
                  <input type="hidden" name="requestType" value="Leave" />
                  <Field name="subject" label="Application subject" required />
                  <Select
                    name="leaveType"
                    label="Leave type"
                    required
                    options={[
                      "Annual",
                      "Sick",
                      "Compassionate",
                      "Study",
                      "Unpaid",
                    ].map((id) => ({ id, name: id }))}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      name="startDate"
                      label="Start date"
                      type="date"
                      required
                    />
                    <Field
                      name="endDate"
                      label="End date"
                      type="date"
                      required
                    />
                  </div>
                  <Field
                    name="resumeDate"
                    label="Expected return date"
                    type="date"
                  />
                  <label className="grid gap-2 text-sm font-medium">
                    Reason and handover notes
                    <textarea name="details" required maxLength={10000} />
                  </label>
                  <button className={button}>
                    <Send size={18} /> Submit leave application
                  </button>
                </Form>
              </div>
              <div className="rounded-md border border-border p-5">
                <h2 className="text-lg font-semibold">Leave history</h2>
                {(requests ?? [])
                  .filter((r) => r.request_type === "Leave")
                  .map((r) => (
                    <div
                      key={r.id}
                      className="mt-4 border-t border-border pt-4"
                    >
                      <strong>{r.subject}</strong>
                      <p className="text-sm text-muted">
                        {requestDetail(r.details, "leaveType")} ·{" "}
                        {requestDetail(r.details, "startDate")} to{" "}
                        {requestDetail(r.details, "endDate")} · {r.status}
                      </p>
                      {r.decision_note && (
                        <p className="mt-1 text-sm">{r.decision_note}</p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}
          {essView === "payslips" && (
            <section>
              <h2 className="text-lg font-semibold">My payslips</h2>
              <div className="mt-4 grid gap-3">
                {ownPayslips.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-4"
                  >
                    <div>
                      <strong>{item.period?.month}</strong>
                      <p className="text-sm text-muted">
                        Gross{" "}
                        {amount(Number(asRecord(item.snapshot).gross ?? 0))} ·
                        Net {amount(Number(asRecord(item.snapshot).net ?? 0))}
                      </p>
                    </div>
                    <Link
                      className={button}
                      href={`${base}/export?report=payslip&period=${item.period_id}&staff=${ownStaff.id}&format=pdf`}
                    >
                      <Download size={17} /> Download
                    </Link>
                  </div>
                ))}
                {!ownPayslips.length && (
                  <p className="text-muted">
                    No paid payroll periods have been issued yet.
                  </p>
                )}
              </div>
            </section>
          )}
          {essView === "p9" && (
            <section>
              <h2 className="text-lg font-semibold">My P9 forms</h2>
              <p className="mt-2 text-muted">
                Annual tax data is generated from your paid payroll history.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {p9Years.map((year) => (
                  <div
                    key={year}
                    className="rounded-md border border-border p-5"
                  >
                    <strong>P9 tax data · {year}</strong>
                    <div className="mt-4 flex gap-4">
                      <Link
                        className="text-primary"
                        href={`${base}/export?report=p9&year=${year}&format=xlsx`}
                      >
                        Download Excel
                      </Link>
                      <Link
                        className="text-primary"
                        href={`${base}/export?report=p9&year=${year}&format=pdf`}
                      >
                        Download PDF
                      </Link>
                    </div>
                  </div>
                ))}
                {!p9Years.length && (
                  <p className="text-muted">
                    No annual payroll data is available yet.
                  </p>
                )}
              </div>
            </section>
          )}
          {essView === "documents" && (
            <section>
              <h2 className="text-lg font-semibold">Issued documents</h2>
              <div className="mt-4 grid gap-3">
                {(documents ?? []).map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-4"
                  >
                    <div>
                      <strong>{document.title}</strong>
                      <p className="text-sm text-muted">
                        {document.file_name} ·{" "}
                        {new Date(document.created_at).toLocaleDateString(
                          "en-KE",
                        )}
                      </p>
                    </div>
                    <Link
                      className="text-primary"
                      href={`${base}/documents?id=${document.id}`}
                    >
                      Download
                    </Link>
                  </div>
                ))}
                {!documents?.length && (
                  <p className="text-muted">
                    No documents have been issued to you yet.
                  </p>
                )}
              </div>
            </section>
          )}
          {essView === "profile" && (
            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-md border border-border p-5">
                <h2 className="text-lg font-semibold">Employment profile</h2>
                {[
                  ["Name", ownStaff.name],
                  ["Staff number", ownStaff.staff_no],
                  ["Job title", ownStaff.job_title],
                  ["Employment type", ownStaff.employment_type],
                  ["Start date", ownStaff.start_date],
                  ["KRA PIN", ownStaff.details.kraPin ?? "Not provided"],
                  ["NSSF number", ownStaff.details.nssfNo ?? "Not provided"],
                  ["SHA number", ownStaff.details.shaNo ?? "Not provided"],
                  ["Bank", ownStaff.details.bank ?? "Not provided"],
                  ["Account", ownStaff.details.account ?? "Not provided"],
                ].map(([label, value]) => (
                  <p
                    key={label}
                    className="mt-3 border-t border-border pt-3 text-sm"
                  >
                    <span className="text-muted">{label}</span>
                    <br />
                    <strong>{value}</strong>
                  </p>
                ))}
              </div>
              <div className="rounded-md border border-border p-5">
                <h2 className="text-lg font-semibold">
                  Request a profile change
                </h2>
                <Form
                  endpoint={endpoint}
                  action="create-ess-request"
                  tab="self-service"
                >
                  <input
                    type="hidden"
                    name="requestType"
                    value="Profile change"
                  />
                  <Field name="subject" label="Reason for change" required />
                  <Select
                    name="fieldName"
                    label="Field to change"
                    required
                    options={[
                      "Phone",
                      "Emergency contact",
                      "Bank name",
                      "Bank account",
                      "KRA PIN",
                      "NSSF number",
                      "SHA number",
                      "National ID",
                    ].map((id) => ({ id, name: id }))}
                  />
                  <Field name="newValue" label="New value" required />
                  <label className="grid gap-2 text-sm font-medium">
                    Supporting explanation
                    <textarea name="details" required />
                  </label>
                  <button className={button}>
                    <Send size={18} /> Send for approval
                  </button>
                </Form>
              </div>
            </section>
          )}
          {essView === "performance" && (
            <section>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">My performance</h2>
                  <p className="mt-1 text-muted">
                    Complete self-reviews and follow supervisor feedback.
                  </p>
                </div>
                <Link className="text-primary" href={`${base}?tab=performance`}>
                  Open appraisals
                </Link>
              </div>
              {data.reviews
                .filter((r) => r.staff_id === ownStaff.id)
                .map((r) => (
                  <div
                    key={r.id}
                    className="mt-4 rounded-md border border-border p-5"
                  >
                    <div className="flex justify-between gap-3">
                      <strong>{r.title}</strong>
                      <span className="text-sm text-muted">{r.status}</span>
                    </div>
                    <p className="mt-2 text-sm">{r.goals}</p>
                    {r.rating && (
                      <p className="mt-2 font-semibold">Rating {r.rating}/5</p>
                    )}
                  </div>
                ))}
            </section>
          )}
          {essView === "requests" && (
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-md border border-border p-5">
                <h2 className="text-lg font-semibold">New HR request</h2>
                <Form
                  endpoint={endpoint}
                  action="create-ess-request"
                  tab="self-service"
                >
                  <Select
                    name="requestType"
                    label="Request type"
                    required
                    options={["Off day", "Complaint", "Salary advance"].map(
                      (id) => ({ id, name: id }),
                    )}
                  />
                  <Field name="subject" label="Subject" required />
                  <Field
                    name="requestedDate"
                    label="Requested date (for off day)"
                    type="date"
                  />
                  <Field
                    name="amount"
                    label="Amount (for salary advance)"
                    type="number"
                  />
                  <label className="grid gap-2 text-sm font-medium">
                    Details
                    <textarea name="details" required maxLength={10000} />
                  </label>
                  <button className={button}>
                    <Send size={18} /> Submit request
                  </button>
                </Form>
              </div>
              <div className="rounded-md border border-border p-5">
                <h2 className="text-lg font-semibold">Request history</h2>
                {(requests ?? []).map((r) => (
                  <div key={r.id} className="mt-4 border-t border-border pt-4">
                    <strong>{r.subject}</strong>
                    <p className="text-sm text-muted">
                      {r.request_type} ·{" "}
                      {new Date(r.submitted_at).toLocaleDateString("en-KE")} ·{" "}
                      {r.status}
                    </p>
                    <p className="mt-1 text-sm">
                      {r.decision_note || requestDetail(r.details, "message")}
                    </p>
                    {r.status === "Pending" && (
                      <Form
                        endpoint={endpoint}
                        action="cancel-ess-request"
                        tab="self-service"
                        id={r.id}
                      >
                        <button className="mt-2 text-sm text-red-700">
                          Cancel request
                        </button>
                      </Form>
                    )}
                  </div>
                ))}
                {!requests?.length && (
                  <p className="mt-3 text-muted">No requests submitted yet.</p>
                )}
              </div>
            </section>
          )}
        </div>
      )}
      {tab === "payroll" && (
        <div className="grid gap-6">
          {access.admin && (
            <details>
              <summary className="cursor-pointer font-semibold">
                Start monthly payroll
              </summary>
              <div className="mt-4 max-w-md">
                <Form endpoint={endpoint} action="create-period" tab="payroll">
                  <Field
                    name="month"
                    label="Payroll month"
                    type="month"
                    required
                  />
                  <button className={button}>
                    <Plus size={18} />
                    Start payroll
                  </button>
                </Form>
              </div>
            </details>
          )}
          <nav className="flex flex-wrap gap-3">
            {data.periods.map((p) => (
              <Link
                key={p.id}
                href={`${base}?tab=payroll&period=${p.id}`}
                className={`rounded-md border px-3 py-2 text-sm ${p.id === period?.id ? "border-primary text-primary" : "border-border"}`}
              >
                {p.month} · {p.status}
              </Link>
            ))}
          </nav>
          {!period && (
            <p className="py-6 text-muted">No payroll available yet.</p>
          )}
          {period && (
            <>
              <h2 className="text-lg font-semibold">
                {period.title} · {period.status}
              </h2>
              {access.admin && period.status === "Draft" && (
                <details>
                  <summary className="cursor-pointer font-semibold">
                    Add earnings or deductions
                  </summary>
                  <div className="mt-4 max-w-xl">
                    <Form
                      endpoint={endpoint}
                      action="add-input"
                      tab="payroll"
                      periodId={period.id}
                    >
                      <Select
                        name="staffId"
                        label="Staff"
                        required
                        options={data.staff
                          .filter(
                            (s) => s.payroll_eligible && s.status === "Active",
                          )
                          .map((s) => ({ id: s.id, name: s.name }))}
                      />
                      <Select
                        name="kind"
                        label="Type"
                        required
                        options={[
                          { id: "Earning", name: "Taxable earning" },
                          { id: "Deduction", name: "After-tax deduction" },
                        ]}
                      />
                      <Field name="description" label="Description" required />
                      <Field
                        name="amount"
                        label="Amount (KES)"
                        type="number"
                        required
                      />
                      <button className={button}>
                        <Plus size={18} />
                        Add input
                      </button>
                    </Form>
                  </div>
                  {inputs?.map((i) => (
                    <div
                      key={i.id}
                      className="mt-3 flex flex-wrap items-center justify-between gap-2 border-b border-border py-3"
                    >
                      <span>
                        {data.staff.find((s) => s.id === i.staff_id)?.name} ·{" "}
                        {i.description} · {i.kind} · {amount(i.amount)}
                      </span>
                      <Form
                        endpoint={endpoint}
                        action="delete-input"
                        tab="payroll"
                        id={i.id}
                        periodId={period.id}
                      >
                        <button className="text-sm text-red-700">Remove</button>
                      </Form>
                    </div>
                  ))}
                </details>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      {[
                        "Staff",
                        "Gross",
                        "NSSF",
                        "SHA",
                        "Housing",
                        "PAYE",
                        "Other",
                        "Net",
                        "Payslip",
                      ].map((h) => (
                        <th key={h} className="border-b border-border p-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(({ id, snapshot: s }) => (
                      <tr key={id}>
                        <td className="p-3">{s.name}</td>
                        {[
                          s.gross,
                          s.nssf,
                          s.sha,
                          s.housing,
                          s.paye,
                          s.deductions,
                          s.net,
                        ].map((v, index) => (
                          <td key={index} className="whitespace-nowrap p-3">
                            {amount(v)}
                          </td>
                        ))}
                        <td className="p-3">
                          {period.status !== "Draft" && (
                            <Link
                              className="text-primary"
                              href={`${base}/export?report=payslip&period=${period.id}&staff=${s.staffId}&format=pdf`}
                            >
                              PDF
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-semibold">
                Net payroll:{" "}
                {amount(items.reduce((sum, i) => sum + i.snapshot.net, 0))}
              </p>
              {period.payment_reference && (
                <p>Payment reference: {period.payment_reference}</p>
              )}
              {access.admin && period.status === "Draft" && (
                <div className="grid max-w-xl gap-5">
                  <Form
                    endpoint={endpoint}
                    action="calculate"
                    tab="payroll"
                    periodId={period.id}
                  >
                    <button className={button}>
                      <Calculator size={18} />
                      Calculate payroll
                    </button>
                  </Form>
                  <Form
                    endpoint={endpoint}
                    action="submit"
                    tab="payroll"
                    periodId={period.id}
                  >
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" name="ratesReviewed" required />I
                      have reviewed earnings, deductions and the Kenya 2026
                      statutory rates.
                    </label>
                    <button className={button} disabled={!period.calculated_at}>
                      <Send size={18} />
                      Submit for approval
                    </button>
                  </Form>
                </div>
              )}
              {access.leader && period.status === "Submitted" && (
                <div className="flex flex-wrap gap-4">
                  <Form
                    endpoint={endpoint}
                    action="approve"
                    tab="payroll"
                    periodId={period.id}
                  >
                    <button
                      className={button}
                      disabled={
                        period.created_by === access.user.id ||
                        period.submitted_by === access.user.id
                      }
                    >
                      <Check size={18} />
                      Approve payroll
                    </button>
                  </Form>
                  <Form
                    endpoint={endpoint}
                    action="return"
                    tab="payroll"
                    periodId={period.id}
                  >
                    <button className="min-h-11 rounded-md border border-border px-4">
                      Return for correction
                    </button>
                  </Form>
                </div>
              )}
              {access.finance && period.status === "Approved" && (
                <div className="max-w-xl">
                  <Form
                    endpoint={endpoint}
                    action="pay"
                    tab="payroll"
                    periodId={period.id}
                  >
                    <Field
                      name="reference"
                      label="Completed bank / payment reference"
                      required
                    />
                    <button className={button}>
                      <Check size={18} />
                      Record payment
                    </button>
                  </Form>
                </div>
              )}
              {(access.admin || access.leader || access.finance) &&
                items.length > 0 && (
                  <details>
                    <summary className="cursor-pointer font-semibold">
                      Download reports
                    </summary>
                    <div className="mt-4 flex flex-wrap gap-4">
                      {[
                        "register",
                        "statutory",
                        "department",
                        "wagebill",
                        "deduction-posting",
                        "earnings-deductions-analysis",
                        "statutory-all",
                        "paye",
                        "shif",
                        "nssf",
                        "housing",
                        "mpesa",
                        "helb",
                        ...(access.admin || access.finance ? ["bank"] : []),
                      ].map((report) => (
                        <div key={report} className="flex gap-3">
                          <strong className="text-sm capitalize">
                            {report}
                          </strong>
                          {["pdf", "xlsx", "csv"].map((format) => (
                            <Link
                              className="text-sm text-primary uppercase"
                              key={format}
                              href={`${base}/export?report=${report}&period=${period.id}&format=${format}`}
                            >
                              {format}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
            </>
          )}
        </div>
      )}
      {tab === "payroll" && (
        <details className="mt-6 border-t border-border pt-5">
          <summary className="cursor-pointer font-semibold">
            Annual tax summary
          </summary>
          <form
            method="get"
            action={`${base}/export`}
            className="mt-4 grid max-w-md gap-4"
          >
            <input type="hidden" name="report" value="annual" />
            <Field
              name="year"
              label="Year"
              type="number"
              required
              value="2026"
            />
            <Select
              name="format"
              label="Format"
              required
              value="pdf"
              options={[
                { id: "pdf", name: "PDF" },
                { id: "xlsx", name: "Excel" },
                { id: "csv", name: "CSV" },
              ]}
            />
            <button className={button}>
              <Download size={18} />
              Download summary
            </button>
          </form>
        </details>
      )}
      {profile && (access.admin || profile.user_id === access.user.id) && (
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="mb-4 text-lg font-semibold">
            {access.admin ? "Staff documents" : "My issued documents"}
          </h2>
          <div className="mb-5 grid gap-3">
            {documents?.map((d) => (
              <Link
                className="text-primary"
                href={`${base}/documents?id=${d.id}`}
                key={d.id}
              >
                {d.title} - {d.file_name} ({d.visibility ?? "Admin only"})
              </Link>
            ))}
          </div>
          <form
            method="post"
            action={`${base}/documents`}
            encType="multipart/form-data"
            className="grid max-w-lg gap-4"
          >
            <input type="hidden" name="staffId" value={profile.id} />
            <Field name="title" label="Document title" required />
            <label className="flex items-center gap-2 text-sm">
              <input name="employeeVisible" type="checkbox" /> Make visible to
              this employee
            </label>
            <label className="grid gap-2 text-sm">
              Document
              <input
                name="file"
                type="file"
                required
                accept="application/pdf,image/png,image/jpeg"
              />
            </label>
            <button className={button}>
              <Save size={18} />
              Upload private document
            </button>
          </form>
        </section>
      )}
      {access.admin && (
        <details className="mt-8 border-t border-border pt-5">
          <summary className="cursor-pointer font-semibold">
            Recent HR activity
          </summary>
          <div className="mt-4 grid gap-3 text-sm">
            {audit?.map((a) => (
              <p key={a.id}>
                {a.action} ·{" "}
                {access.workspace.team.find((m) => m.id === a.actor_id)?.name ??
                  "Administrator"}{" "}
                · {new Date(a.created_at).toLocaleString("en-KE")}
              </p>
            ))}
          </div>
        </details>
      )}
    </WorkspaceShell>
  );
}
