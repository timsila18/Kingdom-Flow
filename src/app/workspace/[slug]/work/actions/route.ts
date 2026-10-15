import { NextResponse } from "next/server";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";
import {
  getWorkspaceAccess,
  mutateWorkspace,
  canOpenSection,
  visibleRecords,
  type WorkspaceRecord,
} from "@/lib/workspace-store";
import { sections } from "@/lib/workspace-config";
import { isChurchUserType } from "@/lib/user-types";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { selectCareWorker } from "@/lib/care-allocation";
import { trainingReadiness } from "@/lib/journey";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new NextResponse("Invalid request", { status: 403 });
  const tenant = await getVisibleTenantBySlug(slug);
  const access = tenant ? await getWorkspaceAccess(tenant.id) : undefined;
  if (!tenant || tenant.status !== "approved" || !access)
    return new NextResponse("Access denied", { status: 403 });
  const form = await request.formData();
  const action = String(form.get("action") ?? "save");
  const section = String(form.get("section") ?? "people");
  const url = new URL(`/workspace/${slug}/work/${section}`, request.url);
  const { member, workspace, user } = access;
  try {
    if (action === "save-team") {
      if (member.type !== "church_admin")
        throw new Error("Only a church administrator can manage accounts.");
      const type = String(form.get("type"));
      const extraTypes = form.getAll("types").map(String);
      if (!extraTypes.every(isChurchUserType))
        throw new Error("Choose valid church user types.");
      const name = String(form.get("name") ?? "").trim();
      const email = String(form.get("email") ?? "")
        .trim()
        .toLowerCase();
      const password = String(form.get("password") ?? "");
      if (
        !isChurchUserType(type) ||
        !name ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      )
        throw new Error("Provide a name, valid email and user type.");
      const client = getSupabaseAdmin();
      let id = String(form.get("id") ?? "");
      if (id && !workspace.team.some((item) => item.id === id))
        throw new Error("User not found.");
      if (!id) {
        const { data: profile } = await client
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (profile) id = profile.id;
        else {
          if (password.length < 12)
            throw new Error(
              "Provide an initial password of at least 12 characters for the new account.",
            );
          const { data, error } = await client.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name },
          });
          if (error || !data.user)
            throw new Error(error?.message ?? "Account could not be created.");
          id = data.user.id;
          const { error: profileError } = await client
            .from("profiles")
            .upsert({ id, email, full_name: name });
          if (profileError)
            throw new Error(
              "Account exists, but its church profile could not be saved. Please try again.",
            );
        }
      }
      const assignedIds = form.getAll("assignedIds").map(String);
      if (
        assignedIds.some(
          (id) =>
            !workspace.records.some(
              (record) =>
                record.id === id &&
                ["departments", "groups", "classes", "people"].includes(
                  record.kind,
                ),
            ),
        )
      )
        throw new Error("Choose valid church assignments.");
      const personId = String(form.get("personId") ?? "");
      if (
        personId &&
        !workspace.records.some(
          (record) => record.id === personId && record.kind === "people",
        )
      )
        throw new Error("Choose a valid person profile.");
      await mutateWorkspace(tenant.id, (current) => {
        const types = Array.from(new Set([type, ...extraTypes]));
        const administrators = current.team.filter((item) =>
          [item.type, ...(item.types ?? [])].includes("church_admin"),
        );
        if (
          administrators.some((item) => item.id === id) &&
          !types.includes("church_admin") &&
          administrators.length <= 1
        )
          throw new Error("Keep at least one church administrator.");
        const previous = current.team.find((item) => item.id === id);
        const existingLeaderForPerson =
          [previous?.type, ...(previous?.types ?? [])].includes("church_leader") &&
          previous?.personId === personId;
        if (types.includes("church_leader") && !existingLeaderForPerson && !personId)
          throw new Error("Link a confirmed person profile before granting church leader access.");
        if (
          types.includes("church_leader") &&
          !existingLeaderForPerson &&
          personId &&
          !current.records.some(
            (record) =>
              record.kind === "leadership-nominations" &&
              record.fields.personId === personId &&
              record.fields.status === "Approved" &&
              record.fields.archived !== "yes",
          )
        )
          throw new Error("Approve a leadership appointment before granting church leader access.");
        current.team = [
          ...current.team.filter((item) => item.id !== id),
          {
            id,
            email: previous?.email ?? email,
            name,
            type,
            types,
            title: String(form.get("title") ?? "").trim(),
            personId,
            assignedIds,
          },
        ];
        return current;
      });
    } else if (action === "save-settings") {
      if (member.type !== "church_admin")
        throw new Error("Only a church administrator can edit church details.");
      const name = String(form.get("publicName") ?? "").trim();
      if (!name) throw new Error("Provide a church name.");
      const { error } = await getSupabaseAdmin()
        .from("tenants")
        .update({
          public_name: name,
          region: String(form.get("region") ?? ""),
          physical_address: String(form.get("physicalAddress") ?? ""),
          ministry_head_title: String(
            form.get("ministryHeadTitle") ?? "Church Leader",
          ),
          updated_at: new Date().toISOString(),
        })
        .eq("id", tenant.id);
      if (error) throw new Error("Church details could not be saved.");
    } else if (action === "save-profile") {
      const name = String(form.get("name") ?? "").trim();
      if (!name) throw new Error("Provide your name.");
      await mutateWorkspace(tenant.id, (current) => {
        const self = current.team.find((item) => item.id === user.id);
        if (self) self.name = name;
        return current;
      });
      const password = String(form.get("password") ?? "");
      if (password) {
        if (password.length < 12)
          throw new Error("Use a password with at least 12 characters.");
        const { error } = await getSupabaseAdmin().auth.admin.updateUserById(
          user.id,
          { password },
        );
        if (error) throw new Error("Your password could not be changed.");
      }
    } else if (action === "assess-class") {
      if (!["church_admin", "ministry_coordinator"].includes(member.type))
        throw new Error("You cannot assess training.");
      const personId = String(form.get("personId"));
      const classId = String(form.get("classId"));
      const assessment = String(form.get("assessment"));
      const note = String(form.get("note") ?? "").trim();
      if (!["Passed", "Needs more work"].includes(assessment) || note.length > 1000)
        throw new Error("Choose a valid assessment and keep notes brief.");
      if (!visibleRecords(workspace, member, "people").some((r) => r.id === personId) ||
          !visibleRecords(workspace, member, "classes").some((r) => r.id === classId))
        throw new Error("Choose a person and class you can access.");
      await mutateWorkspace(tenant.id, (current) => {
        const enrolment = current.records.find((r) => r.kind === "enrolments" && r.fields.personId === personId && r.fields.classId === classId && r.fields.status === "Enrolled" && r.fields.archived !== "yes");
        if (!enrolment) throw new Error("Enrol this person before assessing the class.");
        enrolment.fields.assessment = assessment;
        enrolment.fields.assessmentNote = note;
        enrolment.fields.assessedBy = user.id;
        enrolment.fields.assessedAt = new Date().toISOString();
        return current;
      });
      url.searchParams.set("id", personId);
    } else if (action === "request-department") {
      if (member.type !== "member" || !member.personId)
        throw new Error("Link your member profile before requesting a department.");
      const departmentId = String(form.get("departmentId"));
      if (!visibleRecords(workspace, member, "departments").some((r) => r.id === departmentId && r.fields.published === "yes"))
        throw new Error("This department is not open for requests.");
      await mutateWorkspace(tenant.id, (current) => {
        if (current.records.some((r) => r.kind === "department-memberships" && r.fields.personId === member.personId && r.fields.departmentId === departmentId && r.fields.archived !== "yes" && r.fields.status !== "Declined"))
          throw new Error("You have already requested this department.");
        current.records.push({ id: crypto.randomUUID(), kind: "department-memberships", createdBy: user.id, createdAt: new Date().toISOString(), fields: { personId: member.personId, departmentId, ministryId: departmentId, status: "Requested" } });
        return current;
      });
    } else if (action === "review-department") {
      if (!["church_admin", "ministry_coordinator"].includes(member.type))
        throw new Error("You cannot review department requests.");
      const id = String(form.get("id"));
      const status = String(form.get("status"));
      if (!["Active", "Declined"].includes(status)) throw new Error("Choose a valid decision.");
      const requestRecord = workspace.records.find((r) => r.id === id && r.kind === "department-memberships" && r.fields.status === "Requested");
      if (!requestRecord || !visibleRecords(workspace, member, "people").some((r) => r.id === requestRecord.fields.personId) || !visibleRecords(workspace, member, "departments").some((r) => r.id === requestRecord.fields.departmentId))
        throw new Error("This department request is not assigned to you.");
      await mutateWorkspace(tenant.id, (current) => {
        const record = current.records.find((r) => r.id === id && r.kind === "department-memberships" && r.fields.status === "Requested");
        if (!record) throw new Error("Request has already been reviewed.");
        record.fields.status = status;
        record.fields.reviewedBy = user.id;
        record.fields.reviewedAt = new Date().toISOString();
        return current;
      });
      url.searchParams.set("id", requestRecord.fields.personId);
    } else if (action === "nominate-leader") {
      if (member.type !== "church_admin") throw new Error("Only a church administrator can nominate a leader.");
      const personId = String(form.get("personId"));
      const title = String(form.get("title") ?? "").trim();
      const note = String(form.get("note") ?? "").trim();
      if (!title || title.length > 100 || !note || note.length > 1000) throw new Error("Provide a title and reason for the nomination.");
      await mutateWorkspace(tenant.id, (current) => {
        const person = current.records.find((r) => r.kind === "people" && r.id === personId && r.fields.archived !== "yes" && r.fields.membershipConfirmedBy);
        if (!person) throw new Error("Confirm church membership before nominating a leader.");
        if (current.records.some((r) => r.kind === "leadership-nominations" && r.fields.personId === personId && ["Pending", "Approved"].includes(r.fields.status) && r.fields.archived !== "yes")) throw new Error("This person already has a pending or approved appointment.");
        current.records.push({ id: crypto.randomUUID(), kind: "leadership-nominations", createdBy: user.id, createdAt: new Date().toISOString(), fields: { personId, title, note, status: "Pending" } });
        return current;
      });
      url.searchParams.set("id", personId);
    } else if (action === "review-leader") {
      if (!["church_admin", "church_leader"].includes(member.type)) throw new Error("Only church leadership can review appointments.");
      const id = String(form.get("id"));
      const status = String(form.get("status"));
      if (!["Approved", "Rejected"].includes(status)) throw new Error("Choose a valid decision.");
      let personId = "";
      await mutateWorkspace(tenant.id, (current) => {
        const record = current.records.find((r) => r.id === id && r.kind === "leadership-nominations" && r.fields.status === "Pending" && r.fields.archived !== "yes");
        if (!record) throw new Error("Appointment not found or already reviewed.");
        if (record.createdBy === user.id || member.personId === record.fields.personId) throw new Error("A different leader must review this nomination.");
        personId = record.fields.personId;
        record.fields.status = status;
        record.fields.reviewedBy = user.id;
        record.fields.reviewedAt = new Date().toISOString();
        return current;
      });
      url.searchParams.set("id", personId);
    } else if (
      ["connect", "enrol", "assign-department", "complete-class"].includes(
        action,
      )
    ) {
      if (!["church_admin", "ministry_coordinator"].includes(member.type))
        throw new Error("You cannot assign ministry participation.");
      const personId = String(form.get("personId"));
      if (
        !visibleRecords(workspace, member, "people").some(
          (record) => record.id === personId,
        )
      )
        throw new Error("Choose a person you can access.");
      const key = ["enrol", "complete-class"].includes(action)
        ? "classId"
        : action === "assign-department"
          ? "departmentId"
          : "groupId";
      const target = String(form.get(key));
      const targetKind =
        key === "classId"
          ? "classes"
          : key === "departmentId"
            ? "departments"
            : "groups";
      if (
        !visibleRecords(workspace, member, targetKind).some(
          (record) => record.id === target,
        )
      )
        throw new Error("Choose a ministry you can access.");
      await mutateWorkspace(tenant.id, (current) => {
        const kind =
          key === "classId"
            ? "enrolments"
            : key === "departmentId"
              ? "department-memberships"
              : "connections";
        const existing = current.records.find(
          (record) =>
            record.kind === kind &&
            record.fields.personId === personId &&
            record.fields[key] === target &&
            record.fields.archived !== "yes",
        );
        if (action === "complete-class") {
          if (!existing || existing.fields.status !== "Enrolled")
            throw new Error("Enrol this person before completing the class.");
          const readiness = trainingReadiness(current.records, personId, target);
          if (!readiness.ready)
            throw new Error(`Record ${readiness.required} attended session(s) and a passing assessment before completing training.`);
          existing.fields.status = "Completed";
          existing.fields.completedBy = user.id;
          existing.fields.completedAt = new Date().toISOString();
          return current;
        }
        if (existing?.fields.status === "Requested" && action === "enrol") {
          existing.fields.status = "Enrolled";
          return current;
        }
        if (existing?.fields.status === "Requested" && action === "assign-department") {
          existing.fields.status = "Active";
          existing.fields.reviewedBy = user.id;
          existing.fields.reviewedAt = new Date().toISOString();
          return current;
        }
        if (existing)
          throw new Error("This person is already connected to that ministry.");
        current.records.push({
          id: crypto.randomUUID(),
          kind,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          fields: {
            personId,
            [key]: target,
            ministryId: target,
            status:
              action === "assign-department"
                ? "Active"
                : action === "enrol"
                  ? "Enrolled"
                  : "Connected",
          },
        });
        return current;
      });
      url.searchParams.set("id", personId);
    } else if (action === "join-event" || action === "request-class") {
      if (member.type !== "member")
        throw new Error("This action is for members.");
      const target = String(form.get("targetId"));
      const kind = action === "join-event" ? "events" : "classes";
      if (
        !visibleRecords(workspace, member, kind).some(
          (record) => record.id === target,
        )
      )
        throw new Error("This activity is not available.");
      if (!member.personId)
        throw new Error(
          "Ask your church administrator to link your account to your person profile first.",
        );
      await mutateWorkspace(tenant.id, (current) => {
        const recordKind =
          action === "join-event" ? "registrations" : "enrolments";
        if (
          current.records.some(
            (record) =>
              record.kind === recordKind &&
              record.fields.personId === member.personId &&
              record.fields.ministryId === target,
          )
        )
          throw new Error(
            "You have already registered or requested this activity.",
          );
        current.records.push({
          id: crypto.randomUUID(),
          kind: recordKind,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          fields: {
            personId: member.personId,
            ministryId: target,
            [kind === "classes" ? "classId" : "eventId"]: target,
            status: kind === "classes" ? "Requested" : "Registered",
          },
        });
        return current;
      });
    } else if (action === "review") {
      if (member.type !== "church_leader")
        throw new Error("Only church leaders can review these decisions.");
      const id = String(form.get("id"));
      const status = String(form.get("status"));
      if (!["Approved", "Rejected"].includes(status))
        throw new Error("Choose an approval decision.");
      await mutateWorkspace(tenant.id, (current) => {
        const record = current.records.find(
          (record) =>
            record.id === id && ["expenses", "decisions"].includes(record.kind),
        );
        if (!record) throw new Error("Decision not found.");
        if (record.createdBy === user.id)
          throw new Error("Another leader must review your own request.");
        if (record.fields.status !== "Pending")
          throw new Error("This request has already been reviewed.");
        record.fields = {
          ...record.fields,
          status,
          reviewedBy: user.id,
          reviewedAt: new Date().toISOString(),
        };
        return current;
      });
    } else {
      const config = sections[section];
      if (!config || !canOpenSection(member.type, section))
        throw new Error("You cannot change these records.");
      if (
        (member.type === "member" && section !== "prayer") ||
        (member.type === "church_leader" && section !== "decisions") ||
        (member.type === "ministry_coordinator" && section === "people")
      )
        throw new Error("You have view access to this section.");
      const id = String(form.get("id") ?? "");
      const existing = id
        ? visibleRecords(workspace, member, section).find(
            (record) => record.id === id,
          )
        : undefined;
      if (id && !existing)
        throw new Error("Record not found or not assigned to you.");
      if (
        existing?.fields.status === "Approved" ||
        existing?.fields.status === "Rejected"
      )
        throw new Error("Reviewed records cannot be changed.");
      const fields: Record<string, string> = {};
      for (const field of config.fields) {
        const value = String(form.get(field.key) ?? "").trim();
        if (value.length > (field.type === "textarea" ? 4000 : 500))
          throw new Error(`${field.label} is too long.`);
        if (field.required && !value)
          throw new Error(`Provide ${field.label.toLowerCase()}.`);
        if (value && field.options && !field.options.includes(value))
          throw new Error(`Choose a valid ${field.label.toLowerCase()}.`);
        if (
          value &&
          field.type === "number" &&
          (!Number.isFinite(Number(value)) || Number(value) <= 0)
        )
          throw new Error("Amount must be greater than zero.");
        if (field.key === "requiredSessions" && value && (!Number.isInteger(Number(value)) || Number(value) > 100))
          throw new Error("Required sessions must be a whole number from 1 to 100.");
        if (
          value &&
          field.type === "date" &&
          !/^\d{4}-\d{2}-\d{2}$/.test(value)
        )
          throw new Error("Choose a valid date.");
        if (
          value &&
          field.source === "team" &&
          !workspace.team.some((item) => item.id === value)
        )
          throw new Error("Choose a church team member.");
        if (value && field.source && field.source !== "team") {
          const kinds =
            field.source === "ministry"
              ? ["classes", "groups", "events", "departments"]
              : [field.source];
          if (
            !kinds
              .flatMap((kind) => visibleRecords(workspace, member, kind))
              .some((record) => record.id === value)
          )
            throw new Error(`Choose a valid ${field.label.toLowerCase()}.`);
        }
        fields[field.key] = value;
      }
      if (member.type === "care_worker") fields.assignedTo = user.id;
      if (member.type === "member") {
        fields.personId = member.personId;
        const person = workspace.records.find(
          (record) => record.id === member.personId && record.kind === "people",
        );
        fields.assignedTo =
          person?.fields.assignedTo ||
          selectCareWorker(workspace.team, workspace.records)?.id ||
          "";
      }
      if (["expenses", "decisions"].includes(section))
        fields.status = "Pending";
      await mutateWorkspace(tenant.id, (current) => {
        if (section === "duties" && !current.records.some((r) => r.kind === "department-memberships" && r.fields.personId === fields.personId && r.fields.departmentId === fields.ministryId && r.fields.status === "Active" && r.fields.archived !== "yes"))
          throw new Error("Approve department service before assigning a duty.");
        if (id) {
          const record = current.records.find((record) => record.id === id);
          if (!record) throw new Error("Record no longer exists.");
          if (action === "archive") record.fields.archived = "yes";
          else
            record.fields = {
              ...record.fields,
              ...fields,
              updatedBy: user.id,
              updatedAt: new Date().toISOString(),
            };
        } else {
          const record: WorkspaceRecord = {
            id: crypto.randomUUID(),
            kind: section,
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            fields,
          };
          current.records.push(record);
        }
        return current;
      });
    }
    url.searchParams.set("saved", "1");
  } catch (error) {
    url.searchParams.set(
      "error",
      error instanceof Error
        ? error.message
        : "Your changes could not be saved.",
    );
    if (String(form.get("id") ?? ""))
      url.searchParams.set("edit", String(form.get("id")));
  }
  return NextResponse.redirect(url, 303);
}
