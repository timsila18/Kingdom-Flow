import { describe, expect, it } from "vitest";
import { announcements, conversations } from "./digital-data";
import { canSendMessage, confirmDelivery, getAiCopilotDashboard, getCommunicationDashboard, getDigitalMinistryDashboard, getFellowshipExperience, getLiveNowExperience, getMemberJourney, getMyChurch, getNotificationCenter, getPersonalizedMemberHome, getSermonLibrary, getSermonNotesForPerson, getSolcoRoomAccess, publishAnnouncement, queueCommunication, recordAiUsage, requestPastoralAppointment, runAiCopilot, savePrivateSermonNote, scanDigitalMembershipCard, submitPrayerRequestFromMember, submitTestimony } from "./digital-engine";

const context = { tenantId: "tenant-kings-grace", userId: "user-admin", personId: "person-amina", branchId: "branch-imaara" };

describe("Prompt 11 digital ministry engine", () => {
  it("builds a personalized member home without spiritual scoring", () => {
    const home = getPersonalizedMemberHome(context);
    expect(home.greeting).toContain("Amina");
    expect(home.noSpiritualScore).toBe(true);
    expect(home.liveNow?.secretKeyStored).toBe(false);
  });

  it("shows safe journey and card scan data only", () => {
    const journey = getMemberJourney(context);
    if (!journey.allowed || !journey.milestones) throw new Error("Expected member journey");
    expect(journey.milestones.some((item) => item.sensitive)).toBe(false);
    expect(scanDigitalMembershipCard("kf-card-amina-safe")).toMatchObject({ minimumNecessaryOnly: true, memberNumber: "KGC-000001" });
  });

  it("returns church, fellowship, sermons and live experience safely", () => {
    expect(getMyChurch(context).contentChurchControlled).toBe(true);
    expect(getFellowshipExperience("person-amina")?.exactPrivateAddressHidden).toBe(true);
    const sermon = getSermonLibrary(context)[0];
    expect(sermon?.media.length).toBeGreaterThan(0);
    expect(getLiveNowExperience(context)?.givingPressure).toBe(false);
  });

  it("keeps sermon notes private", () => {
    expect(savePrivateSermonNote({ tenantId: "tenant-kings-grace", sermonId: "sermon-serving-grace-public", personId: "person-amina", note: "Private", privateTags: [] }).privateByDefault).toBe(true);
    expect(getSermonNotesForPerson("sermon-serving-grace-public", "person-david", "person-amina").allowed).toBe(false);
  });

  it("handles prayer, testimony and appointment privacy", () => {
    expect(submitPrayerRequestFromMember("person-amina", "private_pastoral", "Please pray").confidentialDetailsPublic).toBe(false);
    expect(submitTestimony("person-amina", true).publicAutomatically).toBe(false);
    expect(requestPastoralAppointment("person-amina", "Prayer meeting").allowed).toBe(true);
  });

  it("respects communication preferences and delivery evidence", () => {
    expect(publishAnnouncement("ann-emergency-template", "user-branch").allowed).toBe(false);
    expect(queueCommunication(announcements[0], "person-newconvert-john", "sms").queued).toBe(true);
    expect(confirmDelivery("deliv-ann-john").allowed).toBe(false);
    expect(confirmDelivery("deliv-ann-john", "provider-123").allowed).toBe(true);
  });

  it("enforces messaging boundaries for minors and participants", () => {
    expect(canSendMessage("person-amina", "person-child-grace").allowed).toBe(false);
    expect(canSendMessage("person-amina", "person-child-grace", conversations[0]).allowed).toBe(true);
  });

  it("scaffolds Solco without fake production delivery", () => {
    const solco = getSolcoRoomAccess("tenant-kings-grace", "small_group", "group-imaara-family");
    expect(solco.enabled).toBe(true);
    expect(solco.productionDeliveryAvailable).toBe(false);
    expect(solco.fakeApiResult).toBe(false);
  });

  it("runs AI with permission, citations, confirmation and usage limits", () => {
    const leader = runAiCopilot({ tenantId: "tenant-kings-grace", userId: "user-admin", personId: "person-amina" }, "leader_copilot", "Which new converts have not yet been assigned?");
    expect(leader.allowed).toBe(true);
    if (!("sourceRecordIds" in leader)) throw new Error("Expected leader copilot sources");
    expect(leader.sourceRecordIds.length).toBeGreaterThan(0);
    expect(leader.actionRequiresConfirmation).toBe(true);
    const member = runAiCopilot(context, "member_assistant", "How do I join a fellowship?");
    if (!("impersonatesPastor" in member)) throw new Error("Expected member assistant result");
    expect(member.impersonatesPastor).toBe(false);
    expect(recordAiUsage("aireq-newconverts", 999999999).allowed).toBe(false);
  });

  it("returns redacted notification and aggregate dashboards", () => {
    expect(getNotificationCenter("person-visitor-mary")[0].preview).toContain("Sensitive details hidden");
    expect(getCommunicationDashboard("tenant-kings-grace").falseDeliveryClaims).toBe(false);
    expect(getDigitalMinistryDashboard("tenant-kings-grace").noSpiritualCompetitionMetrics).toBe(true);
    expect(getAiCopilotDashboard("tenant-kings-grace").enabled).toBe(true);
  });
});
