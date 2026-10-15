import { NextResponse } from "next/server";
import { hrAccess, hrData } from "@/lib/hr-store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mutateWorkspace } from "@/lib/workspace-store";
import { calculatePay } from "@/lib/hr-payroll";
import { z } from "zod";
const uuid = z.string().uuid();
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new NextResponse("Invalid request", { status: 403 });
  const access = await hrAccess(slug);
  if (!access) return new NextResponse("Access denied", { status: 403 });
  const form = await request.formData();
  const value = (key: string) => String(form.get(key) ?? "").trim();
  const action = value("action");
  const section = ["staff", "self-service", "performance", "payroll"].includes(
    value("section"),
  )
    ? value("section")
    : "staff";
  const url = new URL(`/workspace/${slug}/hr?tab=${section}`, request.url);
  const client = getSupabaseAdmin();
  const requireAdmin = () => {
    if (!access.admin)
      throw new Error("Only the church administrator can do this.");
  };
  const checked = (result: { error: { message: string } | null }) => {
    if (result.error) throw new Error(result.error.message);
  };
  try {
    if (action === "confirm-member") {
      requireAdmin();
      const id = uuid.parse(value("memberId"));
      await mutateWorkspace(access.tenant.id, (workspace) => {
        const person = workspace.records.find(
          (r) =>
            r.id === id && r.kind === "people" && r.fields.archived !== "yes",
        );
        if (!person) throw new Error("Person not found.");
        person.fields.stage = "Member";
        person.fields.membershipConfirmedBy = access.user.id;
        person.fields.membershipConfirmedAt = new Date().toISOString();
        return workspace;
      });
    } else if (action === "save-staff") {
      requireAdmin();
      const memberId = uuid.parse(value("memberId"));
      const person = access.workspace.records.find(
        (r) =>
          r.id === memberId &&
          r.kind === "people" &&
          r.fields.archived !== "yes" &&
          r.fields.stage === "Member" &&
          r.fields.membershipConfirmedBy,
      );
      if (!person)
        throw new Error("Confirm this person's church membership first.");
      const fieldId = (key: string, kind: string) => {
        const id = value(key);
        if (!id) return null;
        uuid.parse(id);
        if (
          !access.workspace.records.some(
            (r) =>
              r.id === id && r.kind === kind && r.fields.archived !== "yes",
          )
        )
          throw new Error(`Invalid ${key}.`);
        return id;
      };
      const supervisor = value("supervisorId") || null;
      if (
        supervisor &&
        !access.workspace.team.some(
          (m) =>
            m.id === supervisor &&
            [m.type, ...(m.types ?? [])].some(
              (t) => t === "church_leader" || t === "church_admin",
            ),
        )
      )
        throw new Error(
          "Choose a church leader or administrator as supervisor.",
        );
      const staffNo = z.string().min(1).max(40).parse(value("staffNo"));
      const jobTitle = z.string().min(1).max(150).parse(value("jobTitle"));
      const employmentType = z
        .enum(["Employee", "Stipend worker", "Volunteer"])
        .parse(value("employmentType"));
      const status = z
        .enum(["Active", "On leave", "Suspended", "Exited"])
        .parse(value("status"));
      const start = z.iso.date().parse(value("startDate"));
      const end = value("endDate")
        ? z.iso.date().parse(value("endDate"))
        : null;
      if (end && end < start)
        throw new Error("End date cannot precede the start date.");
      const basicSalary = z.coerce
        .number()
        .min(0)
        .max(100000000)
        .parse(value("salary"));
      const row = {
        tenant_id: access.tenant.id,
        member_id: memberId,
        user_id:
          access.workspace.team.find((m) => m.personId === memberId)?.id ??
          null,
        staff_no: staffNo,
        name: person.fields.name,
        job_title: jobTitle,
        department_id: fieldId("departmentId", "departments"),
        branch_id: fieldId("branchId", "branches"),
        supervisor_id: supervisor,
        employment_type: employmentType,
        status,
        start_date: start,
        end_date: end,
        basic_salary: basicSalary,
        payroll_eligible:
          employmentType !== "Volunteer" && form.has("payrollEligible"),
        details: {
          resident: value("resident") !== "no",
          bank: value("bank"),
          account: value("account"),
          kraPin: value("kraPin"),
          nssfNo: value("nssfNo"),
          shaNo: value("shaNo"),
          nationalId: value("nationalId"),
          emergencyContact: value("emergencyContact"),
          contractNotes: value("contractNotes"),
        },
        updated_at: new Date().toISOString(),
      };
      const id = value("id");
      if (id) {
        uuid.parse(id);
        const { data, error } = await client
          .from("kf_hr_staff")
          .update(row)
          .eq("id", id)
          .eq("tenant_id", access.tenant.id)
          .select("id");
        checked({ error });
        if (!data?.length) throw new Error("Staff record not found.");
      } else
        checked(
          await client
            .from("kf_hr_staff")
            .insert({ ...row, created_by: access.user.id }),
        );
    } else if (action === "staff-event") {
      requireAdmin();
      const id = uuid.parse(value("staffId"));
      if (!(await hrData(access)).staff.some((s) => s.id === id))
        throw new Error("Staff record not found.");
      checked(
        await client.from("kf_hr_events").insert({
          tenant_id: access.tenant.id,
          staff_id: id,
          kind: z
            .enum([
              "Contract",
              "Confirmation",
              "Promotion",
              "Transfer",
              "Disciplinary",
              "Renewal",
              "Offboarding",
            ])
            .parse(value("kind")),
          note: z.string().min(1).max(5000).parse(value("note")),
          effective_date: z.iso.date().parse(value("date")),
          created_by: access.user.id,
        }),
      );
    } else if (action === "create-ess-request") {
      const requestType = z
        .enum([
          "Leave",
          "Off day",
          "Complaint",
          "Salary advance",
          "Profile change",
        ])
        .parse(value("requestType"));
      const subject = z.string().min(1).max(200).parse(value("subject"));
      const message = z.string().min(1).max(10000).parse(value("details"));
      const { data: staff, error: staffError } = await client
        .from("kf_hr_staff")
        .select("id")
        .eq("tenant_id", access.tenant.id)
        .eq("user_id", access.user.id)
        .neq("status", "Exited")
        .maybeSingle();
      checked({ error: staffError });
      if (!staff)
        throw new Error(
          "Your church administrator has not linked your staff record yet.",
        );
      const details: Record<string, string | number> = { message };
      if (requestType === "Leave") {
        const startDate = z.iso.date().parse(value("startDate"));
        const endDate = z.iso.date().parse(value("endDate"));
        if (endDate < startDate)
          throw new Error("Leave end date cannot precede the start date.");
        details.leaveType = z
          .enum(["Annual", "Sick", "Compassionate", "Study", "Unpaid"])
          .parse(value("leaveType"));
        details.startDate = startDate;
        details.endDate = endDate;
        details.resumeDate = value("resumeDate")
          ? z.iso.date().parse(value("resumeDate"))
          : "";
      } else if (requestType === "Off day") {
        details.requestedDate = z.iso.date().parse(value("requestedDate"));
      } else if (requestType === "Salary advance") {
        details.amount = z.coerce
          .number()
          .positive()
          .max(10000000)
          .parse(value("amount"));
      } else if (requestType === "Profile change") {
        details.fieldName = z
          .enum([
            "Phone",
            "Emergency contact",
            "Bank name",
            "Bank account",
            "KRA PIN",
            "NSSF number",
            "SHA number",
            "National ID",
          ])
          .parse(value("fieldName"));
        details.newValue = z.string().min(1).max(200).parse(value("newValue"));
      }
      checked(
        await client.from("kf_hr_requests").insert({
          tenant_id: access.tenant.id,
          staff_id: staff.id,
          request_type: requestType,
          subject,
          details,
        }),
      );
    } else if (action === "cancel-ess-request") {
      const staff = (await hrData(access)).staff.find(
        (item) => item.user_id === access.user.id,
      );
      if (!staff) throw new Error("Your staff record is not linked.");
      const { data: cancelled, error } = await client
        .from("kf_hr_requests")
        .update({ status: "Cancelled", updated_at: new Date().toISOString() })
        .eq("tenant_id", access.tenant.id)
        .eq("staff_id", staff.id)
        .eq("id", uuid.parse(value("id")))
        .eq("status", "Pending")
        .select("id");
      checked({ error });
      if (!cancelled?.length)
        throw new Error("Only a pending request can be cancelled.");
    } else if (action === "decide-ess-request") {
      requireAdmin();
      const decision = z
        .enum(["Approved", "Rejected", "Returned"])
        .parse(value("decision"));
      const note = z.string().min(2).max(2000).parse(value("decisionNote"));
      const requestId = uuid.parse(value("id"));
      const { data: hrRequest, error: requestError } = await client
        .from("kf_hr_requests")
        .select("id,staff_id,request_type,details,status")
        .eq("tenant_id", access.tenant.id)
        .eq("id", requestId)
        .maybeSingle();
      checked({ error: requestError });
      if (!hrRequest || !["Pending", "Returned"].includes(hrRequest.status))
        throw new Error("This request is no longer awaiting a decision.");
      if (
        decision === "Approved" &&
        hrRequest.request_type === "Profile change"
      ) {
        const staff = (await hrData(access)).staff.find(
          (item) => item.id === hrRequest.staff_id,
        );
        if (!staff) throw new Error("Staff record not found.");
        const fieldMap: Record<string, string> = {
          Phone: "phone",
          "Emergency contact": "emergencyContact",
          "Bank name": "bank",
          "Bank account": "account",
          "KRA PIN": "kraPin",
          "NSSF number": "nssfNo",
          "SHA number": "shaNo",
          "National ID": "nationalId",
        };
        const key = fieldMap[String(hrRequest.details?.fieldName ?? "")];
        const newValue = String(hrRequest.details?.newValue ?? "").trim();
        if (!key || !newValue)
          throw new Error("The requested profile change is incomplete.");
        checked(
          await client
            .from("kf_hr_staff")
            .update({
              details: { ...staff.details, [key]: newValue },
              updated_at: new Date().toISOString(),
            })
            .eq("tenant_id", access.tenant.id)
            .eq("id", staff.id),
        );
      }
      const { data: decided, error } = await client
        .from("kf_hr_requests")
        .update({
          status: decision,
          decision_note: note,
          decided_at: new Date().toISOString(),
          decided_by: access.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("tenant_id", access.tenant.id)
        .eq("id", requestId)
        .in("status", ["Pending", "Returned"])
        .select("id");
      checked({ error });
      if (!decided?.length)
        throw new Error("The request changed. Reload and try again.");
    } else if (action === "create-review") {
      requireAdmin();
      const staffId = uuid.parse(value("staffId"));
      if (
        !(await hrData(access)).staff.some(
          (s) => s.id === staffId && s.status !== "Exited",
        )
      )
        throw new Error("Choose current staff.");
      checked(
        await client.from("kf_hr_reviews").insert({
          tenant_id: access.tenant.id,
          staff_id: staffId,
          title: z.string().min(1).max(200).parse(value("title")),
          cycle_type: z
            .enum(["Quarterly", "Annual", "Mid-year", "Probation", "Custom"])
            .parse(value("cycleType")),
          period_start: z.iso.date().parse(value("startDate")),
          period_end: z.iso.date().parse(value("endDate")),
          goals: z.string().min(1).max(10000).parse(value("goals")),
          created_by: access.user.id,
        }),
      );
    } else if (
      ["self-review", "supervisor-review", "finalise-review"].includes(action)
    ) {
      const data = await hrData(access);
      const review = data.reviews.find((r) => r.id === value("id"));
      const staff = data.staff.find((s) => s.id === review?.staff_id);
      if (!review || !staff || review.status === "Finalised")
        throw new Error("Review is unavailable or finalised.");
      let update: Record<string, unknown>;
      if (action === "self-review") {
        if (
          staff.user_id !== access.user.id ||
          !["Draft", "Self submitted"].includes(review.status)
        )
          throw new Error(
            "Only this staff member can submit their self-review.",
          );
        update = {
          self_review: JSON.stringify({
            whatWentWell: z
              .string()
              .min(1)
              .max(5000)
              .parse(value("whatWentWell")),
            challenges: z.string().min(1).max(5000).parse(value("challenges")),
            supportNeeded: z
              .string()
              .min(1)
              .max(5000)
              .parse(value("supportNeeded")),
          }),
          status: "Self submitted",
        };
      } else if (action === "supervisor-review") {
        if (
          !(
            access.admin ||
            (access.leader && staff.supervisor_id === access.user.id)
          ) ||
          !["Self submitted", "Supervisor reviewed"].includes(review.status) ||
          staff.user_id === access.user.id
        )
          throw new Error(
            "An assigned supervisor must review the staff submission.",
          );
        update = {
          supervisor_review: JSON.stringify({
            strengths: z.string().min(1).max(5000).parse(value("strengths")),
            developmentAreas: z
              .string()
              .min(1)
              .max(5000)
              .parse(value("developmentAreas")),
            nextSteps: z.string().min(1).max(5000).parse(value("nextSteps")),
          }),
          rating: z.coerce.number().min(1).max(5).parse(value("rating")),
          status: "Supervisor reviewed",
        };
      } else {
        requireAdmin();
        if (review.status !== "Supervisor reviewed")
          throw new Error("Complete the supervisor review first.");
        update = { status: "Finalised" };
      }
      const { data: saved, error } = await client
        .from("kf_hr_reviews")
        .update({ ...update, updated_at: new Date().toISOString() })
        .eq("tenant_id", access.tenant.id)
        .eq("id", review.id)
        .eq("updated_at", review.updated_at)
        .select("id");
      checked({ error });
      if (!saved?.length)
        throw new Error("Review changed. Reload and try again.");
    } else if (action === "create-period") {
      requireAdmin();
      const month = z
        .string()
        .regex(/^2026-(0[2-9]|1[0-2])$/)
        .parse(value("month"));
      checked(
        await client.from("kf_hr_periods").insert({
          tenant_id: access.tenant.id,
          month,
          title: `Payroll ${month}`,
          created_by: access.user.id,
        }),
      );
    } else if (action === "add-input" || action === "delete-input") {
      requireAdmin();
      const period = (await hrData(access)).periods.find(
        (p) => p.id === value("periodId") && p.status === "Draft",
      );
      if (!period) throw new Error("Choose draft payroll.");
      if (action === "delete-input")
        checked(
          await client
            .from("kf_hr_inputs")
            .delete()
            .eq("tenant_id", access.tenant.id)
            .eq("period_id", period.id)
            .eq("id", uuid.parse(value("id"))),
        );
      else {
        const staffId = uuid.parse(value("staffId"));
        if (
          !(await hrData(access)).staff.some(
            (s) =>
              s.id === staffId && s.payroll_eligible && s.status === "Active",
          )
        )
          throw new Error("Staff is not payroll eligible.");
        checked(
          await client.from("kf_hr_inputs").insert({
            tenant_id: access.tenant.id,
            period_id: period.id,
            staff_id: staffId,
            kind: z.enum(["Earning", "Deduction"]).parse(value("kind")),
            description: z.string().min(1).max(200).parse(value("description")),
            amount: z.coerce
              .number()
              .positive()
              .max(100000000)
              .parse(value("amount")),
            created_by: access.user.id,
          }),
        );
      }
    } else if (
      ["calculate", "submit", "approve", "return", "pay"].includes(action)
    ) {
      if (["calculate", "submit"].includes(action)) requireAdmin();
      if (["approve", "return"].includes(action) && !access.leader)
        throw new Error("A church leader must review payroll.");
      if (action === "pay" && !access.finance)
        throw new Error("A finance officer must record payment.");
      const data = await hrData(access),
        period = data.periods.find((p) => p.id === value("periodId"));
      if (!period) throw new Error("Payroll period not found.");
      let items: unknown[] = [];
      let rules = {};
      if (action === "calculate") {
        if (access.tenant.country !== "Kenya")
          throw new Error(
            "Payroll currently supports Kenyan churches in KES only.",
          );
        const { data: inputs, error } = await client
          .from("kf_hr_inputs")
          .select("*")
          .eq("tenant_id", access.tenant.id)
          .eq("period_id", period.id);
        checked({ error });
        const { data: settings, error: settingsError } = await client
          .from("tenant_settings")
          .select("updated_at,regional_settings")
          .eq("tenant_id", access.tenant.id)
          .single();
        checked({ error: settingsError });
        const people = settings?.regional_settings?.workspace?.records ?? [];
        items = data.staff
          .filter(
            (s) =>
              s.status === "Active" &&
              s.payroll_eligible &&
              s.start_date.slice(0, 7) <= period.month &&
              (!s.end_date || s.end_date.slice(0, 7) >= period.month),
          )
          .map((s) => {
            if (
              !people.some(
                (p: {
                  id: string;
                  kind: string;
                  fields: Record<string, string>;
                }) =>
                  p.id === s.member_id &&
                  p.kind === "people" &&
                  p.fields.stage === "Member" &&
                  p.fields.membershipConfirmedBy &&
                  p.fields.archived !== "yes",
              )
            )
              throw new Error(
                `${s.name} no longer has confirmed church membership.`,
              );
            return calculatePay(
              {
                ...s,
                departmentName:
                  access.workspace.records.find((r) => r.id === s.department_id)
                    ?.fields.name ?? "Unassigned",
              },
              period.month,
              (inputs ?? []).filter((i) => i.staff_id === s.id),
            );
          });
        rules = {
          version: "KE-2026-year4-v1",
          currency: "KES",
          workspaceVersion: settings?.updated_at,
        };
      }
      if (action === "submit" && !form.has("ratesReviewed"))
        throw new Error(
          "Review the statutory rates and totals before submission.",
        );
      checked(
        await client.rpc("kf_hr_payroll_write", {
          p_tenant: access.tenant.id,
          p_period: period.id,
          p_actor: access.user.id,
          p_action: action,
          p_items: items,
          p_rules: rules,
          p_reference: value("reference"),
        }),
      );
    } else throw new Error("Unknown HR action.");
    if (!["calculate", "submit", "approve", "return", "pay"].includes(action))
      checked(
        await client.from("kf_hr_audit").insert({
          tenant_id: access.tenant.id,
          actor_id: access.user.id,
          action,
          entity_id: uuid.safeParse(value("id")).success ? value("id") : null,
        }),
      );
    url.searchParams.set("success", "Saved successfully");
  } catch (error) {
    url.searchParams.set(
      "error",
      error instanceof z.ZodError
        ? "Check all required fields, dates and amounts."
        : error instanceof Error
          ? error.message
          : "The action could not be completed.",
    );
  }
  return NextResponse.redirect(url, 303);
}
