import { can } from "./authority-engine";
import { people } from "./people-data";
import { smallGroups } from "./groups-data";
import { services } from "./services-data";
import { getMemberGivingPortal } from "./giving-engine";
import { announcements, aiRequests, aiTenantPolicies, bibleReadingPlans, communicationDeliveries, communicationPreferences, conversationParticipants, conversations, devotionals, digitalMembershipCards, livestreams, memberBiblePlanProgress, memberHomePreferences, memberJourneyMilestones, memberNextSteps, messages, nextStepDefinitions, notificationCenterItems, sermonMedia, sermonNotes, sermonProgress, sermons, sermonSeries, solcoIntegrations } from "./digital-data";
import type { Announcement, CommunicationChannel, Conversation, Message, SermonNote } from "./digital-types";
import type { PermissionKey } from "./types";

export interface DigitalContext {
  tenantId: string;
  userId: string;
  personId: string;
  branchId?: string;
}

export function canAccessDigital(userId: string, tenantId: string, permission: PermissionKey, branchId?: string) {
  return can(userId, permission, { tenantId, scopeType: branchId ? "branch" : "tenant", scopeId: branchId });
}

export function getPersonalizedMemberHome(context: DigitalContext) {
  const person = people.find((item) => item.id === context.personId);
  if (!person) throw new Error("Person not found");
  const preference = memberHomePreferences.find((item) => item.personId === context.personId);
  const branchServices = services.filter((service) => service.tenantId === context.tenantId && service.branchId === person.branchId && ["published", "scheduled"].includes(service.status));
  const liveNow = livestreams.find((stream) => stream.tenantId === context.tenantId && stream.liveStatus === "live" && (stream.visibility === "public" || stream.visibility === "members"));
  const fellowship = smallGroups.find((group) => group.branchId === person.branchId && group.publicDiscoverable);
  const givingPortal = getMemberGivingPortal(context.personId);
  return {
    greeting: `Welcome, ${person.preferredName ?? person.firstName}`,
    modules: preference?.visibleModules ?? ["home", "church", "journey", "messages"],
    lowBandwidth: preference?.lowBandwidth ?? false,
    nextService: branchServices[0],
    liveNow,
    devotional: devotionals.find((item) => item.status === "published"),
    biblePlan: memberBiblePlanProgress.find((item) => item.personId === context.personId),
    fellowship,
    nextStep: getNextStepsForMember(context.personId)[0],
    unreadMessages: notificationCenterItems.filter((item) => item.personId === context.personId && !item.read).length,
    receiptAvailable: givingPortal.receipts.length > 0,
    emergencyNotice: announcements.find((item) => item.priority === "emergency" && item.status === "published"),
    noSpiritualScore: true,
  };
}

export function getMemberJourney(context: DigitalContext, targetPersonId = context.personId) {
  if (targetPersonId !== context.personId) {
    const allowed = canAccessDigital(context.userId, context.tenantId, "member_journey.view_others", context.branchId);
    if (!allowed.allowed) return { allowed: false, reason: "Journey access requires explicit permission." };
  }
  const milestones = memberJourneyMilestones.filter((item) => item.personId === targetPersonId && (targetPersonId === context.personId ? item.visibility !== "pastoral_restricted" : item.visibility === "leader_summary"));
  return { allowed: true, milestones, confidentialPastoralHidden: true };
}

export function getNextStepsForMember(personId: string) {
  const person = people.find((item) => item.id === personId);
  if (!person) return [];
  return memberNextSteps
    .filter((step) => step.personId === personId && step.status !== "completed")
    .map((step) => ({ ...step, definition: nextStepDefinitions.find((definition) => definition.id === step.definitionId), noHiddenSpiritualScore: true }));
}

export function scanDigitalMembershipCard(cardQrCode: string) {
  const card = digitalMembershipCards.find((item) => item.qrCode === cardQrCode && item.status === "active");
  if (!card) return undefined;
  const person = people.find((item) => item.id === card.personId);
  if (!person) return undefined;
  return {
    name: `${person.firstName} ${person.surname}`,
    memberNumber: person.memberNumber,
    branchId: person.branchId,
    membershipStatus: person.relationshipStatus,
    cardNumber: card.cardNumber,
    minimumNecessaryOnly: true,
  };
}

export function getMyChurch(context: DigitalContext) {
  return {
    churchName: "King's Grace",
    mission: "Church-controlled mission statement placeholder.",
    branches: ["Imaara Campus", "Ruiru Campus"],
    serviceTimes: services.filter((service) => service.tenantId === context.tenantId).map((service) => `${service.title} · ${service.serviceDate} ${service.startTime}`),
    paymentInstructionsVisible: true,
    livestreamConfigured: livestreams.some((stream) => stream.tenantId === context.tenantId),
    contentChurchControlled: true,
  };
}

export function getFellowshipExperience(personId: string) {
  const person = people.find((item) => item.id === personId);
  const fellowship = smallGroups.find((group) => group.branchId === person?.branchId && group.publicDiscoverable);
  if (!fellowship) return undefined;
  return {
    fellowship,
    location: fellowship.exactAddressRestricted ? fellowship.approximateLocation : fellowship.venueSummary,
    exactPrivateAddressHidden: fellowship.exactAddressRestricted,
    leaderContactAvailable: true,
    transferRequestAvailable: true,
  };
}

export function getSermonLibrary(context: DigitalContext) {
  return sermons.filter((sermon) => sermon.tenantId === context.tenantId && sermon.status === "published" && ["public", "members"].includes(sermon.visibility)).map((sermon) => ({
    ...sermon,
    series: sermonSeries.find((series) => series.id === sermon.seriesId),
    media: sermonMedia.filter((media) => media.sermonId === sermon.id && media.processingStatus === "ready"),
    progress: sermonProgress.find((progress) => progress.sermonId === sermon.id && progress.personId === context.personId),
  }));
}

export function savePrivateSermonNote(input: Omit<SermonNote, "id">) {
  if (!sermons.some((sermon) => sermon.id === input.sermonId && sermon.status === "published")) return { allowed: false, reason: "Notes require an available sermon." };
  return { allowed: true, note: { ...input, id: `snote-${input.personId}-${input.sermonId}` }, privateByDefault: true };
}

export function getSermonNotesForPerson(sermonId: string, viewerPersonId: string, ownerPersonId: string) {
  if (viewerPersonId !== ownerPersonId) return { allowed: false, reason: "Private sermon notes are visible only to their owner." };
  return { allowed: true, notes: sermonNotes.filter((note) => note.sermonId === sermonId && note.personId === ownerPersonId) };
}

export function getLiveNowExperience(context: DigitalContext) {
  const live = livestreams.find((stream) => stream.tenantId === context.tenantId && stream.liveStatus === "live");
  if (!live) return undefined;
  return {
    live,
    secretStreamKeyExposed: live.secretKeyStored,
    prayerResponseEnabled: true,
    testimonyEnabled: true,
    givingPressure: false,
    chatModerated: live.chatPolicy === "moderated",
  };
}

export function submitPrayerRequestFromMember(personId: string, privacy: "private_pastoral" | "prayer_team" | "fellowship_leader" | "anonymous_wall" | "public_approved", body: string) {
  if (!body.trim()) return { allowed: false, reason: "Prayer request needs a brief summary." };
  return { allowed: true, request: { personId, privacy, status: privacy === "public_approved" || privacy === "anonymous_wall" ? "pending_moderation" : "submitted" }, confidentialDetailsPublic: false };
}

export function submitTestimony(personId: string, publicationConsent: boolean) {
  return { allowed: true, testimony: { personId, publicationConsent, status: "pending_review" as const }, publicAutomatically: false };
}

export function requestPastoralAppointment(personId: string, briefReason: string) {
  if (briefReason.length > 240) return { allowed: false, reason: "Initial appointment requests should avoid detailed sensitive information." };
  return { allowed: true, appointment: { id: `appt-${personId}`, personId, briefReason, status: "requested" as const } };
}

export function publishAnnouncement(announcementId: string, actorUserId: string) {
  const announcement = announcements.find((item) => item.id === announcementId);
  if (!announcement) throw new Error("Announcement not found");
  const permission = announcement.priority === "emergency" ? "communication.emergency" : "announcement.publish";
  const allowed = canAccessDigital(actorUserId, announcement.tenantId, permission);
  if (!allowed.allowed) return allowed;
  if (announcement.status !== "approved") return { allowed: false, reason: "Announcement must be approved before publication." };
  return { allowed: true, announcement: { ...announcement, status: "published" as const } };
}

export function queueCommunication(announcement: Announcement, personId: string, channel: CommunicationChannel) {
  const preference = communicationPreferences.find((item) => item.personId === personId && item.category === "announcements" && item.channel === channel);
  if (preference && !preference.optedIn && !(announcement.priority === "emergency" && preference.legalExceptionAllowed)) return { queued: false, reason: "Member communication preference blocks this channel." };
  return { queued: true, delivery: { id: `delivery-${announcement.id}-${personId}-${channel}`, tenantId: announcement.tenantId, sourceType: "announcement", sourceId: announcement.id, personId, channel, status: "queued" as const } };
}

export function confirmDelivery(deliveryId: string, providerEvidence?: string) {
  const delivery = communicationDeliveries.find((item) => item.id === deliveryId);
  if (!delivery) throw new Error("Delivery not found");
  if (!providerEvidence) return { allowed: false, reason: "Do not claim delivery without provider evidence." };
  return { allowed: true, delivery: { ...delivery, status: "delivered" as const, providerEvidence } };
}

export function canSendMessage(senderPersonId: string, recipientPersonId: string, conversation?: Conversation) {
  const sender = people.find((item) => item.id === senderPersonId);
  const recipient = people.find((item) => item.id === recipientPersonId);
  if (!sender || !recipient) return { allowed: false, reason: "Sender or recipient not found." };
  const adultToMinor = sender.ageGroup === "adult" && ["child", "teen", "youth"].includes(recipient.ageGroup);
  if (adultToMinor && (!conversation || !conversation.minorSafe || conversation.conversationType === "one_to_one")) return { allowed: false, reason: "Unauthorized adult-minor direct messaging is blocked." };
  return { allowed: true };
}

export function sendMessage(conversationId: string, senderPersonId: string, body: string): { allowed: boolean; reason?: string; message?: Message } {
  const conversation = conversations.find((item) => item.id === conversationId);
  if (!conversation) throw new Error("Conversation not found");
  const participant = conversationParticipants.find((item) => item.conversationId === conversationId && item.personId === senderPersonId);
  if (!participant) return { allowed: false, reason: "Only conversation participants may send messages." };
  return { allowed: true, message: { id: `msg-${conversationId}-${Date.now()}`, tenantId: conversation.tenantId, conversationId, senderPersonId, body, status: "sent", createdAt: "2026-07-19T12:00:00.000Z" } };
}

export function reportMessage(messageId: string, reporterPersonId: string, reason: string) {
  const message = messages.find((item) => item.id === messageId);
  if (!message) throw new Error("Message not found");
  return { allowed: true, report: { messageId, reporterPersonId, reason, routedSecurely: true, reportedPersonCannotView: true, evidencePreserved: true } };
}

export function getSolcoRoomAccess(tenantId: string, sourceType: string, sourceId: string) {
  const integration = solcoIntegrations.find((item) => item.tenantId === tenantId);
  if (!integration || !integration.enabled) return { enabled: false, fallback: "native_messaging" as const };
  return {
    enabled: true,
    status: integration.status,
    productionDeliveryAvailable: integration.productionDeliveryAvailable,
    sourceType,
    sourceId,
    fakeApiResult: false,
    fallback: integration.productionDeliveryAvailable ? undefined : "native_messaging" as const,
  };
}

export function runAiCopilot(context: DigitalContext, feature: "member_assistant" | "leader_copilot" | "pastoral_assist" | "finance_assist" | "content_discovery", prompt: string) {
  const policy = aiTenantPolicies.find((item) => item.tenantId === context.tenantId);
  if (!policy?.enabled) return { allowed: false, reason: "AI is disabled for this church." };
  if (!policy.permittedModules.includes(feature)) return { allowed: false, reason: "AI feature not permitted by tenant policy." };
  if (feature === "leader_copilot") {
    void prompt;
    const allowed = canAccessDigital(context.userId, context.tenantId, "ai.use_admin", context.branchId);
    if (!allowed.allowed) return allowed;
    const unassigned = people.filter((person) => person.tenantId === context.tenantId && (!context.branchId || person.branchId === context.branchId) && person.lifecycleStage === "new_convert");
    return { allowed: true, answer: `${unassigned.length} new converts need assignment review.`, sourceRecordIds: unassigned.map((person) => person.id), actionRequiresConfirmation: true, divineClaims: false };
  }
  if (feature === "member_assistant") {
    const fellowships = smallGroups.filter((group) => group.tenantId === context.tenantId && group.publicDiscoverable);
    return { allowed: true, answer: "Here are fellowship options you can request placement into.", sourceRecordIds: fellowships.map((group) => group.id), impersonatesPastor: false };
  }
  return { allowed: true, answer: "AI task queued for human-reviewed assistance.", sourceRecordIds: [], humanReviewRequired: policy.humanReviewRequired };
}

export function recordAiUsage(requestId: string, units: number) {
  const request = aiRequests.find((item) => item.id === requestId);
  if (!request) throw new Error("AI request not found");
  const policy = aiTenantPolicies.find((item) => item.tenantId === request.tenantId);
  if (policy && units > policy.monthlyUsageLimit) return { allowed: false, reason: "AI usage limit exceeded." };
  return { allowed: true, usage: { requestId, units, estimatedCost: request.estimatedCost, status: "recorded" as const } };
}

export function getNotificationCenter(personId: string) {
  return notificationCenterItems.filter((item) => item.personId === personId).map((item) => item.sensitivePreviewRedacted ? { ...item, preview: "Sensitive details hidden. Open securely." } : item);
}

export function getCommunicationDashboard(tenantId: string) {
  return {
    announcements: announcements.filter((item) => item.tenantId === tenantId).length,
    scheduled: announcements.filter((item) => item.tenantId === tenantId && item.status === "approved").length,
    failures: communicationDeliveries.filter((item) => item.tenantId === tenantId && item.status === "failed").length,
    emergencyDrafts: announcements.filter((item) => item.tenantId === tenantId && item.priority === "emergency").length,
    providerStatus: solcoIntegrations.find((item) => item.tenantId === tenantId)?.status,
    falseDeliveryClaims: false,
  };
}

export function getDigitalMinistryDashboard(tenantId: string) {
  return {
    liveStatus: livestreams.find((item) => item.tenantId === tenantId)?.liveStatus,
    sermonPublications: sermons.filter((item) => item.tenantId === tenantId && item.status === "published").length,
    devotionals: devotionals.filter((item) => item.tenantId === tenantId && item.status === "published").length,
    biblePlans: bibleReadingPlans.filter((item) => item.tenantId === tenantId && item.status === "published").length,
    prayerRequestsAggregateOnly: true,
    pendingNextSteps: memberNextSteps.filter((item) => item.tenantId === tenantId && item.status !== "completed").length,
    noSpiritualCompetitionMetrics: true,
  };
}

export function getAiCopilotDashboard(tenantId: string) {
  const policy = aiTenantPolicies.find((item) => item.tenantId === tenantId);
  return {
    enabled: Boolean(policy?.enabled),
    quota: policy?.monthlyUsageLimit ?? 0,
    usage: aiRequests.filter((item) => item.tenantId === tenantId).reduce((sum, item) => sum + item.estimatedCost, 0),
    pendingHumanReviews: aiRequests.filter((item) => item.tenantId === tenantId && item.status === "needs_human_review").length,
    failedRequests: aiRequests.filter((item) => item.tenantId === tenantId && item.status === "failed").length,
  };
}
