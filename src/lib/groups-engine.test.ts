import { describe, expect, it } from "vitest";
import {
  buildAbsenceFollowUpTasks,
  calculateGivingRow,
  calculateMeetingGiving,
  canAccessGroup,
  captureUnregisteredAttendee,
  getEveryPersonMattersGroupAdditions,
  getGroupAnalytics,
  getPublicGroupDirectory,
  recordFaithDecisionFromMeeting,
  reviewMeetingReport,
  wouldCreateGroupCycle,
} from "./groups-engine";
import { groupMeetingReports, smallGroups } from "./groups-data";

describe("Prompt 5 small groups engine", () => {
  it("allows assigned group leaders without broad branch grants", () => {
    const group = smallGroups.find((item) => item.id === "group-imaara-family")!;
    expect(canAccessGroup("user-volunteer", group, "small_group.attendance.record").allowed).toBe(true);
  });

  it("prevents hierarchy cycles", () => {
    expect(wouldCreateGroupCycle("group-imaara-family", "group-ruiru-youth")).toBe(true);
  });

  it("blocks self approval of submitted reports", () => {
    const report = groupMeetingReports.find((item) => item.id === "report-ruiru-20260710")!;
    expect(reviewMeetingReport(report.id, report.submittedByUserId!, "approved").allowed).toBe(false);
  });

  it("calculates giving totals and rejects negative values", () => {
    expect(calculateMeetingGiving("meeting-imaara-20260708").grandTotal).toBe(3500);
    expect(() => calculateGivingRow({ cash: -1, mpesa: 0, bank: 0, card: 0, cheque: 0, other: 0 })).toThrow("cannot be negative");
  });

  it("builds neutral absent-member follow-up tasks", () => {
    const tasks = buildAbsenceFollowUpTasks("group-imaara-family");
    expect(tasks[0]?.description).toContain("needs contact needed");
    expect(tasks[0]?.description).not.toContain("spiritual");
  });

  it("captures visitors without forcing full membership", () => {
    const result = captureUnregisteredAttendee({ tenantId: "tenant-kings-grace", branchId: "branch-imaara", groupId: "group-imaara-family", meetingId: "meeting-imaara-20260715", firstName: "Nia", surname: "Guest", phone: "+254799000001", consentToContact: true, madeFaithDecision: false });
    expect(result.attendance.attendeeType).toBe("first_timer");
    expect(result.visitor.visit.wantsFellowship).toBe(false);
  });

  it("does not duplicate active new-convert journeys", () => {
    expect(recordFaithDecisionFromMeeting("person-newconvert-john", "meeting-ruiru-20260710").created).toBe(false);
  });

  it("keeps public directory addresses approximate", () => {
    const directory = getPublicGroupDirectory({ tenantId: "tenant-kings-grace", userId: "user-admin" });
    expect(directory[0]?.exactAddress).toBeUndefined();
    expect(directory.some((item) => item.name === "Imaara Family Fellowship")).toBe(true);
  });

  it("returns real analytics for dashboard additions", () => {
    const context = { tenantId: "tenant-kings-grace", userId: "user-admin" };
    expect(getGroupAnalytics(context).activeGroups).toBeGreaterThan(0);
    expect(getEveryPersonMattersGroupAdditions(context).groupJoinRequests).toBeGreaterThan(0);
  });
});
