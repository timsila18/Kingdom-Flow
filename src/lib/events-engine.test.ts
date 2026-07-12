import { describe, expect, it } from "vitest";
import {
  approveMissionApplication,
  assignAccommodation,
  boardPassenger,
  calculateRegistrationTotal,
  canAccessMissionDocument,
  cancelEvent,
  captureOutreachContact,
  getCheckInRecordForVolunteer,
  getChildrenDashboard,
  getEventDashboard,
  getEventReports,
  getPublicEventPage,
  getSafeguardingReadiness,
  issueTicket,
  publishEvent,
  registerParticipant,
  scanTicket,
  submitEventForApproval,
  validateChildPickup,
} from "./events-engine";

describe("Prompt 8 events, outreach, missions and children engine", () => {
  it("submits, publishes and cancels events only through approved workflows", () => {
    expect(submitEventForApproval("event-youth-camp", "user-branch").allowed).toBe(true);
    expect(publishEvent("event-youth-camp", "user-branch").allowed).toBe(false);
    const cancelled = cancelEvent("event-conference-2026", "user-admin", "Weather alert");
    expect(cancelled.allowed).toBe(true);
    expect("notificationPreview" in cancelled ? cancelled.notificationPreview : "").toContain("Refund review");
  });

  it("calculates fees without charging technology fees for free child ministry events", () => {
    expect(calculateRegistrationTotal("ecat-member").total).toBe(1585);
    expect(calculateRegistrationTotal("ecat-child").total).toBe(0);
  });

  it("registers adults, blocks minors without guardians and uses waitlists at capacity", () => {
    expect(registerParticipant({ tenantId: "tenant-kings-grace", eventId: "event-conference-2026", personId: "person-david", categoryId: "ecat-member", branchId: "branch-imaara", ageGroup: "adult", source: "member", emergencyContact: "+254711000111" }).accepted).toBe(true);
    expect(registerParticipant({ tenantId: "tenant-kings-grace", eventId: "event-child-2026", personId: "person-child-grace", categoryId: "ecat-child", branchId: "branch-imaara", ageGroup: "child", source: "household", emergencyContact: "+254700000001" }).accepted).toBe(false);
  });

  it("issues tickets, detects duplicate check-in and exposes minimum check-in data", () => {
    expect(issueTicket("ereg-amina", "user-admin").allowed).toBe(true);
    const scan = scanTicket("KIC-AMINA-001", "user-volunteer");
    expect("status" in scan ? scan.status : "").toBe("duplicate");
    expect(getCheckInRecordForVolunteer("ereg-amina")?.privateProfileHidden).toBe(true);
  });

  it("handles transport and accommodation safeguards", () => {
    expect(boardPassenger("eroute-imaara", "ereg-mary").boarded).toBe(true);
    expect(assignAccommodation("ereg-grace-child", "Dorm 1").assigned).toBe(true);
  });

  it("blocks unauthorized child pickup and confirms authorized pickup", () => {
    expect(validateChildPickup("childcin-grace", "person-visitor-mary", "WRONG").allowed).toBe(false);
    expect(validateChildPickup("childcin-grace", "person-amina", "GRACE-42").allowed).toBe(true);
  });

  it("keeps safeguarding and mission documents restricted", () => {
    expect(getSafeguardingReadiness("event-child-2026").ready).toBe(true);
    expect(canAccessMissionDocument("mdoc-john-consent", "user-volunteer").allowed).toBe(false);
  });

  it("captures outreach contacts with consent and duplicate detection", () => {
    const contact = captureOutreachContact({ tenantId: "tenant-kings-grace", campaignId: "outreach-eastleigh", name: "Mary Wairimu", phone: "+254722000010", consent: true, churchInterest: true, programmeInterest: false, fellowshipInterest: true, newConvertStatus: "none" });
    expect(contact.duplicatePersonId).toBe("person-visitor-mary");
  });

  it("does not automatically approve mission participation", () => {
    expect(approveMissionApplication("mapp-john", "user-admin").allowed).toBe(false);
  });

  it("builds dashboards, reports and public pages from privacy-safe data", () => {
    const context = { tenantId: "tenant-kings-grace", userId: "user-admin" };
    expect(getEventDashboard(context).upcomingEvents).toBeGreaterThan(0);
    expect(JSON.stringify(getEventReports(context).speakers)).not.toContain("+254711222333");
    expect(getChildrenDashboard().pickupIssues).toBeGreaterThan(0);
    expect(getPublicEventPage("event-conference-2026")?.privacyNotice).toContain("approved public");
  });
});
