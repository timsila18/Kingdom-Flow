import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

nextEnv.loadEnvConfig(process.cwd());
const base = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
const slug = `verification-${Date.now()}`;
const temporaryUsers = [];
let temporaryOwner;
let tenantId;
let checks = 0;
let workflowFailure;
const check = (condition, message) => {
  assert.ok(condition, message);
  checks++;
};

async function post(path, cookie, values) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    for (const item of Array.isArray(value) ? value : [value])
      body.append(key, String(item));
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    body,
    headers: { cookie: cookie ?? "", origin: base },
    redirect: "manual",
  });
  const location = response.headers.get("location");
  check(
    response.status === 303,
    `${path}: unexpected status ${response.status}`,
  );
  check(
    location && !new URL(location, base).searchParams.has("error"),
    `${path}: ${location ? new URL(location, base).searchParams.get("error") : "no redirect"}`,
  );
  return response;
}
async function login(email, password) {
  const response = await post("/auth/login", "", { email, password });
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  check(
    cookie.includes("kingdomflow_session="),
    "Verified login must set a session cookie.",
  );
  return cookie;
}
async function document() {
  const { data, error } = await admin
    .from("tenant_settings")
    .select("regional_settings")
    .eq("tenant_id", tenantId)
    .single();
  assert.ifError(error);
  return data.regional_settings.workspace;
}
async function save(cookie, section, fields, action = "save") {
  await post(`/workspace/${slug}/work/actions`, cookie, {
    section,
    action,
    ...fields,
  });
  return document();
}
async function page(cookie, path) {
  const response = await fetch(`${base}${path}`, {
    headers: { cookie },
    redirect: "manual",
  });
  check(
    response.status === 200,
    `${path}: expected a rendered page, got ${response.status}.`,
  );
  return response.text();
}
try {
  let ownerEmail = process.env.ADMIN_EMAIL;
  let ownerPassword = process.env.ADMIN_PASSWORD;
  if (!ownerEmail || !ownerPassword) {
    ownerEmail = `${slug}-platform@example.invalid`;
    ownerPassword = `Verify!${randomUUID()}`;
    const { data, error } = await admin.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: { full_name: "Workflow verifier" },
      app_metadata: { role: "super_admin" },
    });
    assert.ifError(error);
    temporaryOwner = data.user.id;
  }
  const owner = await login(ownerEmail, ownerPassword);
  await post("/onboarding/submit", owner, {
    publicName: "Workflow verification",
    slug,
    country: "Kenya",
    contactEmail: "verification@example.invalid",
    principalLeaderName: "Verification leader",
    ministryHeadTitle: "Church Leader",
    authorized: "on",
  });
  const { data: church, error } = await admin
    .from("tenants")
    .select("id,status")
    .eq("slug", slug)
    .single();
  assert.ifError(error);
  tenantId = church.id;
  check(church.status === "under_review", "Church must await approval.");
  const waiting = await page(owner, "/platform/churches?tab=pending");
  check(
    waiting.includes("Workflow verification"),
    "Registration must appear in the shared approval queue.",
  );
  await post(`/platform/churches/${slug}/action`, owner, {
    decision: "approve",
    reason: "Temporary automated workflow verification",
  });
  let workspace = await save(owner, "people", {
    name: "Verification person",
    phone: "",
    email: "",
    stage: "New convert",
    assignedTo: "",
  });
  const personId = workspace.records.find((item) => item.kind === "people").id;
  workspace = await save(owner, "departments", {
    name: "Verification department",
    assignedTo: "",
    published: "yes",
  });
  const departmentId = workspace.records.find(
    (item) => item.kind === "departments",
  ).id;
  workspace = await save(owner, "groups", {
    name: "Verification fellowship",
    location: "",
    assignedTo: "",
  });
  const groupId = workspace.records.find((item) => item.kind === "groups").id;
  workspace = await save(owner, "classes", {
    name: "Verification discipleship",
    track: "Discipleship",
    date: "2026-09-21",
    requiredSessions: "1",
    assignedTo: "",
    published: "yes",
  });
  const classId = workspace.records.find((item) => item.kind === "classes").id;
  workspace = await save(owner, "events", {
    name: "Verification event",
    date: "2026-09-21",
    location: "",
    published: "yes",
  });
  const eventId = workspace.records.find((item) => item.kind === "events").id;
  const accounts = {};
  for (const type of [
    "church_admin",
    "ministry_coordinator",
    "care_worker",
    "finance_officer",
    "member",
    "church_leader",
  ]) {
    let leaderPersonId = "";
    if (type === "church_leader") {
      workspace = await save(owner, "people", {
        name: "Verification pastor",
        phone: "",
        email: "",
        stage: "Member",
        assignedTo: "",
      });
      leaderPersonId = workspace.records.find((item) => item.kind === "people" && item.fields.name === "Verification pastor").id;
      await post(`/workspace/${slug}/hr/actions`, owner, { action: "confirm-member", section: "staff", memberId: leaderPersonId });
      await save(owner, "people", { personId: leaderPersonId, title: "Pastor", note: "Verified pastoral nomination" }, "nominate-leader");
      workspace = await document();
      const nomination = workspace.records.find((item) => item.kind === "leadership-nominations" && item.fields.personId === leaderPersonId);
      await save(accounts.church_admin.cookie, "people", { id: nomination.id, status: "Approved" }, "review-leader");
    }
    const email = `${slug}-${type}@example.invalid`;
    const password = `Verify!${randomUUID()}`;
    workspace = await save(
      owner,
      "team",
      {
        email,
        password,
        name: `Verification ${type}`,
        type,
        title: "",
        personId: type === "member" ? personId : leaderPersonId,
        assignedIds: ["care_worker", "ministry_coordinator"].includes(type)
          ? [personId, departmentId, groupId, classId]
          : [],
      },
      "save-team",
    );
    const account = workspace.team.find((item) => item.email === email);
    check(Boolean(account), `User type ${type} must persist.`);
    temporaryUsers.push(account.id);
    const cookie = await login(email, password);
    accounts[type] = { cookie, id: account.id, email, password };
    const html = await page(cookie, `/workspace/${slug}`);
    check(
      html.includes(
        type === "care_worker"
          ? "My follow-up"
          : type === "finance_officer"
            ? "Church finances"
            : type === "church_leader"
              ? "Church overview"
              : type === "ministry_coordinator"
                ? "My ministry"
                : "My church",
      ),
      `${type} must have its own home screen.`,
    );
  }
  check(
    (
      await page(accounts.member.cookie, `/workspace/${slug}/work/people`)
    ).includes("Access restricted"),
    "Member must not access the people directory.",
  );
  const newcomerEmail = `${slug}-newcomer@example.invalid`;
  const newcomerPassword = `Verify!${randomUUID()}`;
  const registration = await post("/auth/register/submit", "", {
    email: newcomerEmail,
    password: newcomerPassword,
    name: "Joining person",
    churchId: tenantId,
    phone: "0700000000",
    mode: "join",
    type: "church_admin",
  });
  let newcomerCookie = registration.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  check(
    newcomerCookie.includes("kingdomflow_session="),
    "Registration must sign the person in without email confirmation.",
  );
  check(
    new URL(registration.headers.get("location"), base).pathname ===
      `/workspace/${slug}`,
    "Registration must open the selected church immediately.",
  );
  workspace = await document();
  const joinedMember = workspace.team.find(
    (item) => item.email === newcomerEmail,
  );
  temporaryUsers.push(joinedMember.id);
  const joinedPerson = workspace.records.find(
    (item) => item.id === joinedMember.personId,
  );
  check(
    joinedMember.type === "member",
    "Self-registration must not grant staff privileges.",
  );
  check(
    joinedPerson.fields.assignedTo === accounts.care_worker.id,
    "Joining person must be allocated to the care worker.",
  );
  check(
    (await page(accounts.care_worker.cookie, `/workspace/${slug}`)).includes(
      "Joining person",
    ),
    "Care worker must see their new-person queue.",
  );
  check(
    (await page(newcomerCookie, `/workspace/${slug}`)).includes(
      "Your care worker is",
    ),
    "New member must see their allocated care worker.",
  );
  await post("/auth/join-church/submit", newcomerCookie, {
    churchId: tenantId,
    name: "Joining person",
  });
  workspace = await document();
  check(
    workspace.team.filter((item) => item.id === joinedMember.id).length === 1,
    "Repeated joining must not duplicate membership.",
  );
  const recovery = await admin.auth.admin.generateLink({
    type: "recovery",
    email: newcomerEmail,
    options: { redirectTo: `${base}/auth/reset-password` },
  });
  assert.ifError(recovery.error);
  const recoveryClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false } },
  );
  const recovered = await recoveryClient.auth.verifyOtp({
    type: "recovery",
    token_hash: recovery.data.properties.hashed_token,
  });
  assert.ifError(recovered.error);
  check(
    Boolean(recovered.data.session),
    "Valid recovery token must establish an authorised reset session.",
  );
  const resetPassword = `Reset!${randomUUID()}`;
  const reset = await recoveryClient.auth.updateUser({
    password: resetPassword,
  });
  assert.ifError(reset.error);
  check(
    Boolean(reset.data.user),
    "Recovery session must allow changing the password.",
  );
  newcomerCookie = await login(newcomerEmail, resetPassword);
  const oldLogin = await recoveryClient.auth.signInWithPassword({
    email: newcomerEmail,
    password: newcomerPassword,
  });
  check(
    Boolean(oldLogin.error),
    "The previous password must stop working after reset.",
  );
  check(
    (await page(newcomerCookie, `/workspace/${slug}/work/people`)).includes(
      "Access restricted",
    ),
    "Self-joined users must not access the church directory.",
  );
  const coordinator = workspace.team.find(
    (item) => item.id === accounts.ministry_coordinator.id,
  );
  await save(
    owner,
    "team",
    { ...coordinator, types: ["care_worker"] },
    "save-team",
  );
  const switched = await post(
    `/workspace/${slug}/work/switch`,
    accounts.ministry_coordinator.cookie,
    { type: "care_worker" },
  );
  const switchCookie = switched.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  check(
    (
      await page(
        `${accounts.ministry_coordinator.cookie}; ${switchCookie}`,
        `/workspace/${slug}`,
      )
    ).includes("My follow-up"),
    "Assigned responsibilities must switch views using the same login.",
  );
  const invalidSwitch = await fetch(`${base}/workspace/${slug}/work/switch`, {
    method: "POST",
    body: new URLSearchParams({ type: "church_admin" }),
    headers: { cookie: accounts.member.cookie, origin: base },
    redirect: "manual",
  });
  check(
    invalidSwitch.status === 403,
    "Users must not switch to unassigned responsibilities.",
  );
  const denied = await fetch(`${base}/workspace/${slug}/work/actions`, {
    method: "POST",
    body: new URLSearchParams({
      section: "giving",
      name: "Denied",
      amount: "5",
      currency: "KES",
      date: "2026-09-21",
    }),
    headers: { cookie: accounts.member.cookie, origin: base },
    redirect: "manual",
  });
  check(
    new URL(denied.headers.get("location"), base).searchParams.has("error"),
    "Member finance writes must be rejected.",
  );
  const platformDenied = await fetch(`${base}/platform`, {
    headers: { cookie: accounts.member.cookie },
    redirect: "manual",
  });
  check(
    platformDenied.status === 307,
    "Member must not enter platform administration.",
  );
  workspace = await save(accounts.care_worker.cookie, "follow-up", {
    personId,
    method: "Phone",
    result: "Contacted",
    nextDate: "2026-09-21",
    assignedTo: "",
    note: "Temporary verification",
  });
  check(
    workspace.records.some(
      (item) => item.kind === "follow-up" && item.fields.result === "Contacted",
    ),
    "Contact must persist.",
  );
  await save(owner, "people", { personId, classId }, "enrol");
  await save(owner, "people", { personId, groupId }, "connect");
  await save(owner, "people", { personId, departmentId }, "assign-department");
  await save(owner, "duties", {
    personId,
    ministryId: departmentId,
    name: "Verification duty",
    date: "2026-09-21",
    recurrence: "Weekly",
  });
  const profile = await page(
    owner,
    `/workspace/${slug}/work/people?id=${personId}`,
  );
  check(
    profile.includes("Verification person") && profile.includes("Serving"),
    "Person profile must show the journey.",
  );
  await save(
    accounts.member.cookie,
    "events",
    { targetId: eventId },
    "join-event",
  );
  check(
    (
      await page(accounts.member.cookie, `/workspace/${slug}/work/events`)
    ).includes("Registered"),
    "Event registration must be visible.",
  );
  workspace = await save(owner, "classes", {
    name: "Requested class",
    date: "2026-09-21",
    assignedTo: accounts.ministry_coordinator.id,
    published: "yes",
  });
  const requestedClass = workspace.records.find(
    (item) => item.fields.name === "Requested class",
  ).id;
  await save(
    accounts.member.cookie,
    "my-classes",
    { targetId: requestedClass },
    "request-class",
  );
  check(
    (await page(owner, `/workspace/${slug}/work/classes`)).includes(
      "Confirm enrolment",
    ),
    "Class request must reach church administration.",
  );
  workspace = await save(
    owner,
    "classes",
    { personId, classId: requestedClass },
    "enrol",
  );
  check(
    workspace.records.some(
      (item) =>
        item.kind === "enrolments" &&
        item.fields.classId === requestedClass &&
        item.fields.status === "Enrolled",
    ),
    "Requested class must be confirmable.",
  );
  await save(accounts.ministry_coordinator.cookie, "attendance", {
    personId,
    ministryId: classId,
    date: "2026-09-21",
    status: "Present",
  });
  await save(owner, "people", { personId, classId, assessment: "Passed", note: "Completed the foundation activities" }, "assess-class");
  workspace = await save(owner, "people", { personId, classId }, "complete-class");
  check(workspace.records.some((item) => item.kind === "enrolments" && item.fields.personId === personId && item.fields.classId === classId && item.fields.status === "Completed"), "Recorded attendance and assessment must complete training.");
  await save(accounts.member.cookie, "prayer", {
    name: "Verification prayer",
    note: "Temporary verification",
    status: "Open",
  });
  await save(accounts.finance_officer.cookie, "giving", {
    name: "Verification giving",
    amount: "100",
    currency: "KES",
    date: "2026-09-21",
    reference: "Verification",
  });
  workspace = await save(accounts.finance_officer.cookie, "expenses", {
    name: "Verification expense",
    amount: "50",
    currency: "KES",
    date: "2026-09-21",
    reference: "Verification",
  });
  const expenseId = workspace.records.find(
    (item) => item.kind === "expenses",
  ).id;
  workspace = await save(
    accounts.church_leader.cookie,
    "decisions",
    { id: expenseId, status: "Approved" },
    "review",
  );
  check(
    workspace.records.find((item) => item.id === expenseId).fields.status ===
      "Approved",
    "A separate church leader must be able to approve the expense.",
  );
  check(
    (
      await page(
        accounts.finance_officer.cookie,
        `/workspace/${slug}/work/receipts`,
      )
    ).includes("Verification giving"),
    "Giving receipt must be accessible.",
  );
  const freshCookie = await login(
    accounts.member.email,
    accounts.member.password,
  );
  check(
    (await page(freshCookie, `/workspace/${slug}/work/my-duties`)).includes(
      "Verification duty",
    ),
    "Records must persist across fresh logins.",
  );
  const unauth = await fetch(`${base}/workspace/${slug}`, {
    redirect: "manual",
  });
  check(
    unauth.status === 307,
    "Signed-out users must be redirected to sign-in.",
  );
  const hrPath = `/workspace/${slug}/hr/actions`;
  const hr = async (cookie, action, section, fields = {}) =>
    post(hrPath, cookie, { action, section, ...fields });
  const rejectedHR = async (cookie, action, fields = {}) => {
    const response = await fetch(`${base}${hrPath}`, {
      method: "POST",
      body: new URLSearchParams({ action, ...fields }),
      headers: { cookie, origin: base },
      redirect: "manual",
    });
    check(
      response.status === 403 ||
        Boolean(
          response.headers.get("location") &&
          new URL(response.headers.get("location"), base).searchParams.has(
            "error",
          ),
        ),
      `HR ${action} must be rejected.`,
    );
  };
  const staffFields = {
    memberId: personId,
    staffNo: "KF001",
    jobTitle: "Church administrator",
    employmentType: "Employee",
    status: "Active",
    startDate: "2026-01-01",
    salary: "50000",
    payrollEligible: "on",
    resident: "yes",
    supervisorId: accounts.church_leader.id,
    departmentId,
    bank: "Test Bank",
    account: "001122",
    kraPin: "TEST",
    nssfNo: "TEST",
    shaNo: "TEST",
  };
  await rejectedHR(owner, "save-staff", staffFields);
  await hr(owner, "confirm-member", "staff", { memberId: personId });
  await hr(owner, "save-staff", "staff", staffFields);
  const { data: hrStaff, error: hrStaffError } = await admin
    .from("kf_hr_staff")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();
  assert.ifError(hrStaffError);
  check(
    hrStaff.member_id === personId && hrStaff.user_id === accounts.member.id,
    "Staff must link to the confirmed member and their existing account.",
  );
  await rejectedHR(accounts.member.cookie, "save-staff", staffFields);
  check(
    (await page(owner, `/workspace/${slug}/hr`)).includes("KF001"),
    "HR navigation must show the real staff register.",
  );
  const memberHR = await page(accounts.member.cookie, `/workspace/${slug}/hr`);
  check(
    !memberHR.includes("50,000"),
    "Unpaid salary must not appear on a member HR home.",
  );
  await hr(owner, "create-review", "performance", {
    staffId: hrStaff.id,
    title: "Annual review",
    cycleType: "Annual",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    goals: "Complete assigned administrative work on time",
  });
  const { data: review, error: reviewError } = await admin
    .from("kf_hr_reviews")
    .select("id")
    .eq("tenant_id", tenantId)
    .single();
  assert.ifError(reviewError);
  await rejectedHR(accounts.finance_officer.cookie, "self-review", {
    id: review.id,
    comments: "Not my review",
  });
  await hr(accounts.member.cookie, "self-review", "performance", {
    id: review.id,
    comments: "Goals completed",
  });
  await hr(accounts.church_leader.cookie, "supervisor-review", "performance", {
    id: review.id,
    comments: "Work verified",
    rating: "4",
  });
  await hr(owner, "finalise-review", "performance", { id: review.id });
  await rejectedHR(accounts.member.cookie, "self-review", {
    id: review.id,
    comments: "Changed",
  });
  await hr(owner, "create-period", "payroll", { month: "2026-09" });
  const { data: period, error: periodError } = await admin
    .from("kf_hr_periods")
    .select("id")
    .eq("tenant_id", tenantId)
    .single();
  assert.ifError(periodError);
  await rejectedHR(owner, "submit", {
    periodId: period.id,
    ratesReviewed: "on",
  });
  await hr(owner, "add-input", "payroll", {
    periodId: period.id,
    staffId: hrStaff.id,
    kind: "Earning",
    description: "Allowance",
    amount: "1000",
  });
  await hr(owner, "calculate", "payroll", { periodId: period.id });
  await hr(owner, "save-staff", "staff", { ...staffFields, id: hrStaff.id });
  await rejectedHR(owner, "submit", {
    periodId: period.id,
    ratesReviewed: "on",
  });
  await hr(owner, "calculate", "payroll", { periodId: period.id });
  await hr(owner, "submit", "payroll", {
    periodId: period.id,
    ratesReviewed: "on",
  });
  await rejectedHR(owner, "approve", { periodId: period.id });
  await rejectedHR(accounts.member.cookie, "approve", { periodId: period.id });
  await hr(accounts.church_leader.cookie, "approve", "payroll", {
    periodId: period.id,
  });
  await rejectedHR(owner, "add-input", {
    periodId: period.id,
    staffId: hrStaff.id,
    kind: "Deduction",
    description: "Locked",
    amount: "10",
  });
  await hr(accounts.finance_officer.cookie, "pay", "payroll", {
    periodId: period.id,
    reference: "TEMP-VERIFIED-PAYMENT",
  });
  const { data: paid, error: paidError } = await admin
    .from("kf_hr_periods")
    .select("*")
    .eq("id", period.id)
    .single();
  assert.ifError(paidError);
  check(
    paid.status === "Paid" &&
      paid.approved_by === accounts.church_leader.id &&
      paid.paid_by === accounts.finance_officer.id,
    "Payroll approval and payment actors must persist.",
  );
  check(
    (
      await page(accounts.member.cookie, `/workspace/${slug}/hr?tab=payroll`)
    ).includes("TEMP-VERIFIED-PAYMENT"),
    "Staff must see their paid payslip.",
  );
  for (const report of [
    "staff",
    "performance",
    "register",
    "statutory",
    "bank",
    "payslip",
  ])
    for (const format of ["pdf", "xlsx", "csv"]) {
      const response = await fetch(
        `${base}/workspace/${slug}/hr/export?report=${report}&format=${format}&period=${period.id}&staff=${hrStaff.id}`,
        {
          headers: {
            cookie: report === "payslip" ? accounts.member.cookie : owner,
          },
        },
      );
      check(
        response.status === 200,
        `${report}/${format} report must download.`,
      );
      const bytes = Buffer.from(await response.arrayBuffer());
      if (
        process.env.VERIFY_REPORT_DIR &&
        format === "pdf" &&
        ["staff", "payslip"].includes(report)
      ) {
        await mkdir(process.env.VERIFY_REPORT_DIR, { recursive: true });
        await writeFile(
          join(process.env.VERIFY_REPORT_DIR, `${report}.pdf`),
          bytes,
        );
      }
      check(
        bytes.length > 50 &&
          (format !== "pdf" || bytes.subarray(0, 5).toString() === "%PDF-") &&
          (format !== "xlsx" || bytes.subarray(0, 2).toString() === "PK"),
        `${report}/${format} must contain the expected document format.`,
      );
    }
  const hiddenReport = await fetch(
    `${base}/workspace/${slug}/hr/export?report=register&format=csv&period=${period.id}`,
    { headers: { cookie: accounts.member.cookie } },
  );
  check(
    hiddenReport.status === 403,
    "Staff must not export other employees' payroll.",
  );
  await hr(owner, "staff-event", "staff", {
    staffId: hrStaff.id,
    kind: "Contract",
    date: "2026-09-18",
    note: "Temporary contract history",
  });
  check(
    (
      await page(owner, `/workspace/${slug}/hr?tab=staff&staff=${hrStaff.id}`)
    ).includes("Temporary contract history"),
    "Staff history must persist.",
  );
  for (const report of ["annual", "department"]) {
    const response = await fetch(
      `${base}/workspace/${slug}/hr/export?report=${report}&format=csv&period=${period.id}&year=2026`,
      { headers: { cookie: owner } },
    );
    check(
      response.status === 200 &&
        (await response.text()).includes(
          report === "annual" ? "2026-09" : "Verification department",
        ),
      `${report} report must include saved payroll.`,
    );
  }
  const upload = new FormData();
  upload.set("staffId", hrStaff.id);
  upload.set("title", "Temporary contract document");
  upload.set(
    "file",
    new Blob(
      [
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aTqkAAAAASUVORK5CYII=",
          "base64",
        ),
      ],
      { type: "image/png" },
    ),
    "test.png",
  );
  const uploaded = await fetch(`${base}/workspace/${slug}/hr/documents`, {
    method: "POST",
    body: upload,
    headers: { cookie: owner, origin: base },
    redirect: "manual",
  });
  check(
    uploaded.status === 303 &&
      !new URL(uploaded.headers.get("location"), base).searchParams.has(
        "error",
      ),
    "Private staff document upload must succeed.",
  );
  const { data: privateDoc, error: privateError } = await admin
    .from("kf_hr_documents")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();
  assert.ifError(privateError);
  const authorisedDownload = await fetch(
    `${base}/workspace/${slug}/hr/documents?id=${privateDoc.id}`,
    { headers: { cookie: owner }, redirect: "manual" },
  );
  check(
    authorisedDownload.status === 303 &&
      Boolean(authorisedDownload.headers.get("location")),
    "Administrator can obtain a private download.",
  );
  const deniedDownload = await fetch(
    `${base}/workspace/${slug}/hr/documents?id=${privateDoc.id}`,
    { headers: { cookie: accounts.member.cookie }, redirect: "manual" },
  );
  check(
    deniedDownload.status === 403,
    "Staff cannot download the administrator's private personnel documents.",
  );
  const publicDoc = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kingdomflow-hr-private/${privateDoc.storage_path}`,
  );
  check(
    publicDoc.status !== 200,
    "Personnel documents must not be publicly accessible.",
  );
  const anonymous = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false } },
  );
  const directHR = await anonymous
    .from("kf_hr_staff")
    .select("*")
    .eq("tenant_id", tenantId);
  check(
    Boolean(directHR.error) || !directHR.data?.length,
    "Anonymous API clients cannot read staff records.",
  );
  workspace = await save(owner, "people", {
    name: "Finance staff person",
    stage: "Member",
    email: accounts.finance_officer.email,
    phone: "",
    assignedTo: "",
  });
  const financePersonId = workspace.records.find(
    (r) => r.fields.name === "Finance staff person",
  ).id;
  const financeTeam = workspace.team.find(
    (m) => m.id === accounts.finance_officer.id,
  );
  await save(
    owner,
    "team",
    { ...financeTeam, personId: financePersonId },
    "save-team",
  );
  await hr(owner, "confirm-member", "staff", { memberId: financePersonId });
  await hr(owner, "save-staff", "staff", {
    memberId: financePersonId,
    staffNo: "KF002",
    jobTitle: "Volunteer treasurer",
    employmentType: "Volunteer",
    status: "Active",
    startDate: "2026-01-01",
    salary: "0",
    supervisorId: accounts.church_leader.id,
    resident: "yes",
  });
  const { data: financeStaff, error: financeStaffError } = await admin
    .from("kf_hr_staff")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("member_id", financePersonId)
    .single();
  assert.ifError(financeStaffError);
  await hr(owner, "create-review", "performance", {
    staffId: financeStaff.id,
    title: "Finance staff own review",
    cycleType: "Annual",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    goals: "Maintain accurate records",
  });
  check(
    (
      await page(
        accounts.finance_officer.cookie,
        `/workspace/${slug}/hr?tab=performance`,
      )
    ).includes("Submit my review"),
    "Finance officers who are also staff must have their own review controls without another user type.",
  );
  const { data: financeReview, error: financeReviewError } = await admin
    .from("kf_hr_reviews")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("staff_id", financeStaff.id)
    .single();
  assert.ifError(financeReviewError);
  await hr(accounts.finance_officer.cookie, "self-review", "performance", {
    id: financeReview.id,
    comments: "Records complete",
  });
  console.log(
    `PASS: ${checks} workflow assertions, all seven user types, real shared persistence and access checks.`,
  );
} catch (error) {
  workflowFailure = error;
  console.error("Workflow verification failed:", error);
} finally {
  const cleanupFailures = [];
  if (!tenantId) {
    const { data } = await admin
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    tenantId = data?.id;
  }
  if (tenantId) {
    const { data: files, error: fileError } = await admin
      .from("kf_hr_documents")
      .select("storage_path")
      .eq("tenant_id", tenantId);
    assert.ifError(fileError);
    if (files?.length) {
      const removed = await admin.storage
        .from("kingdomflow-hr-private")
        .remove(files.map((f) => f.storage_path));
      assert.ifError(removed.error);
    }
    const { data } = await admin
      .from("tenant_settings")
      .select("regional_settings")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    const ids =
      data?.regional_settings?.workspace?.team
        ?.filter((item) => item.email?.startsWith(slug))
        .map((item) => item.id) ?? [];
    for (const id of ids)
      if (!temporaryUsers.includes(id)) temporaryUsers.push(id);
    const { error } = await admin
      .from("tenants")
      .delete()
      .eq("id", tenantId)
      .eq("slug", slug);
    if (error) cleanupFailures.push(`Temporary church cleanup failed: ${error.message}`);
  }
  for (const id of temporaryUsers) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) cleanupFailures.push(`Temporary account ${id} cleanup failed: ${error.message}`);
  }
  if (temporaryOwner) {
    const { error } = await admin.auth.admin.deleteUser(temporaryOwner);
    if (error) cleanupFailures.push(`Temporary platform account ${temporaryOwner} cleanup failed: ${error.message}`);
  }
  if (cleanupFailures.length) {
    for (const failure of cleanupFailures) console.error(failure);
    throw new Error("Verification cleanup is incomplete; investigate the listed account IDs before another run.");
  }
  console.log("Temporary verification church and accounts removed.");
}
if (workflowFailure) throw workflowFailure;
