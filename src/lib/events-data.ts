import type {
  AuthorizedPickup,
  CampusFellowship,
  CampusTransition,
  ChildCheckIn,
  ChildPickupAttempt,
  ChildrenClass,
  EventAccommodationAllocation,
  EventCheckIn,
  EventIncident,
  EventMealPlan,
  EventPassengerManifest,
  EventRegistration,
  EventRegistrationCategory,
  EventReport,
  EventRoom,
  EventSession,
  EventSpeaker,
  EventTeamAssignment,
  EventTicket,
  EventTransportRoute,
  EventType,
  MinistryEvent,
  MissionApplication,
  MissionDocument,
  MissionTrip,
  OutreachCampaign,
  OutreachContact,
  SafeguardingRatioRule,
  YouthMinistryRecord,
} from "./events-types";

export const eventTypes: EventType[] = [
  { id: "etype-conference", tenantId: "tenant-kings-grace", key: "conference", displayName: "Conference", defaultTicketingMode: "paid", guardianConsentRequired: false, safeguardingLevel: "standard", speakerRequired: true, volunteerRequired: true, transportRequired: true, accommodationRequired: true, mealRequired: true, checkInMethod: "hybrid", active: true },
  { id: "etype-childrens", tenantId: "tenant-kings-grace", key: "children_activity", displayName: "Children's Activity", defaultTicketingMode: "free", guardianConsentRequired: true, safeguardingLevel: "minor_required", speakerRequired: false, volunteerRequired: true, transportRequired: false, accommodationRequired: false, mealRequired: true, checkInMethod: "qr", active: true },
  { id: "etype-outreach", tenantId: "tenant-kings-grace", key: "outreach", displayName: "Outreach", defaultTicketingMode: "free", guardianConsentRequired: false, safeguardingLevel: "elevated", speakerRequired: false, volunteerRequired: true, transportRequired: true, accommodationRequired: false, mealRequired: false, checkInMethod: "manual", active: true },
  { id: "etype-mission", tenantId: "tenant-kings-grace", key: "mission_trip", displayName: "Mission Trip", defaultTicketingMode: "subsidized" as "free", guardianConsentRequired: true, safeguardingLevel: "restricted", speakerRequired: false, volunteerRequired: true, transportRequired: true, accommodationRequired: true, mealRequired: true, checkInMethod: "hybrid", active: true },
];

export const ministryEvents: MinistryEvent[] = [
  { id: "event-conference-2026", tenantId: "tenant-kings-grace", branchId: "branch-imaara", organizationUnitId: "unit-head", eventTypeId: "etype-conference", title: "Kingdom Impact Conference", subtitle: "Three days of worship, discipleship and mission", description: "A multi-day conference with sessions, outreach, transport, accommodation and follow-up.", theme: "Sent to Serve", objectives: ["Equip leaders", "Welcome first-timers", "Coordinate outreach follow-up"], targetAudience: ["leaders", "members", "visitors"], ageGroup: "all", venue: "Imaara Main Auditorium", city: "Nairobi", onlineHybridStatus: "hybrid", startDate: "2026-08-21", endDate: "2026-08-23", registrationOpenAt: "2026-07-20T06:00:00.000Z", registrationCloseAt: "2026-08-18T20:00:00.000Z", capacity: 600, expectedAttendance: 520, ownerUserId: "user-admin", coordinatorUserId: "user-branch", presidingMinisterUserId: "user-admin", approvalStatus: "approved", publicationStatus: "public", registrationStatus: "open", paymentStatus: "collecting", safeguardingLevel: "elevated", securityLevel: "elevated", transportRequired: true, accommodationRequired: true, mealsRequired: true, status: "registration_open" },
  { id: "event-child-2026", tenantId: "tenant-kings-grace", branchId: "branch-imaara", organizationUnitId: "unit-imaara", eventTypeId: "etype-childrens", title: "Children's Discovery Day", description: "Age-group classes with guardian consent, pickup controls and child-safe reporting.", theme: "Known and Loved", objectives: ["Safe check-in", "Guardian pickup", "Age-appropriate discipleship"], targetAudience: ["children", "guardians"], ageGroup: "children", venue: "Children's Wing", city: "Nairobi", onlineHybridStatus: "onsite", startDate: "2026-08-01", endDate: "2026-08-01", registrationOpenAt: "2026-07-18T06:00:00.000Z", registrationCloseAt: "2026-07-31T20:00:00.000Z", capacity: 80, expectedAttendance: 45, ownerUserId: "user-admin", coordinatorUserId: "user-volunteer", approvalStatus: "approved", publicationStatus: "approved_public", registrationStatus: "open", paymentStatus: "free", safeguardingLevel: "minor_required", securityLevel: "restricted", transportRequired: false, accommodationRequired: false, mealsRequired: true, status: "registration_open" },
  { id: "event-youth-camp", tenantId: "tenant-kings-grace", branchId: "branch-ruiru", organizationUnitId: "unit-youth", eventTypeId: "etype-conference", title: "Youth Camp", description: "Youth camp with guardian consent, transport, accommodation and mentoring follow-up.", theme: "Rooted", objectives: ["Mentorship", "Safe fellowship", "Campus transition"], targetAudience: ["teens", "youth"], ageGroup: "youth", venue: "Naivasha Camp", city: "Naivasha", onlineHybridStatus: "onsite", startDate: "2026-08-28", endDate: "2026-08-30", registrationOpenAt: "2026-07-25T06:00:00.000Z", registrationCloseAt: "2026-08-24T20:00:00.000Z", capacity: 120, expectedAttendance: 95, ownerUserId: "user-branch", coordinatorUserId: "user-branch", approvalStatus: "pending", publicationStatus: "private", registrationStatus: "not_open", paymentStatus: "not_started", safeguardingLevel: "minor_required", securityLevel: "elevated", transportRequired: true, accommodationRequired: true, mealsRequired: true, status: "pending_approval" },
];

export const eventTeamAssignments: EventTeamAssignment[] = [
  { id: "eteam-director", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", userId: "user-branch", role: "Event Director", scope: "event", startsAt: "2026-07-20", endsAt: "2026-08-25", permissions: ["event.update", "event.registration.manage", "event.report.manage"], status: "active" },
  { id: "eteam-childsafe", tenantId: "tenant-kings-grace", eventId: "event-child-2026", userId: "user-admin", role: "Safeguarding Lead", scope: "children_area", startsAt: "2026-07-18", endsAt: "2026-08-02", permissions: ["children.view_sensitive", "children.pickup.manage", "event.safeguarding.manage"], status: "active" },
  { id: "eteam-checkin", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", userId: "user-volunteer", role: "Registration Lead", scope: "event", startsAt: "2026-08-21", endsAt: "2026-08-23", permissions: ["event.check_in"], status: "active" },
];

export const eventSessions: EventSession[] = [
  { id: "esess-opening", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", title: "Opening Plenary", sessionType: "plenary", date: "2026-08-21", startTime: "18:00", endTime: "20:00", roomId: "eroom-main", speakerId: "espeaker-joy", capacity: 600, targetAudience: ["all"], registrationRequired: true, checkInRequired: true, status: "ready" },
  { id: "esess-workshop", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", title: "Community Outreach Workshop", sessionType: "workshop", date: "2026-08-22", startTime: "10:00", endTime: "11:30", roomId: "eroom-breakout", speakerId: "espeaker-joy", capacity: 120, targetAudience: ["leaders", "outreach"], registrationRequired: true, checkInRequired: true, status: "planned" },
  { id: "esess-children", tenantId: "tenant-kings-grace", eventId: "event-child-2026", title: "Discovery Class", sessionType: "children", date: "2026-08-01", startTime: "09:00", endTime: "12:00", roomId: "eroom-child", facilitatorUserId: "user-admin", capacity: 40, targetAudience: ["children"], registrationRequired: true, checkInRequired: true, status: "ready" },
];

export const eventRegistrationCategories: EventRegistrationCategory[] = [
  { id: "ecat-member", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", name: "Member Full Pass", capacity: 300, price: 1500, technologyFee: 50, providerFee: 35, eligibility: "Active member or approved attendee", ageGroup: "adult", approvalRequired: false, mealEligible: true, accommodationEligible: true, transportEligible: true },
  { id: "ecat-visitor", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", name: "Visitor Pass", capacity: 200, price: 1000, technologyFee: 50, providerFee: 25, eligibility: "Open public registration", ageGroup: "adult", approvalRequired: false, mealEligible: true, accommodationEligible: false, transportEligible: true },
  { id: "ecat-child", tenantId: "tenant-kings-grace", eventId: "event-child-2026", name: "Child Registration", capacity: 40, price: 0, technologyFee: 0, providerFee: 0, eligibility: "Guardian consent required", ageGroup: "child", approvalRequired: true, mealEligible: true, accommodationEligible: false, transportEligible: false },
];

export const eventRegistrations: EventRegistration[] = [
  { id: "ereg-amina", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", personId: "person-amina", categoryId: "ecat-member", branchId: "branch-imaara", ageGroup: "adult", householdId: "household-otieno", paymentStatus: "verified", mealChoice: "standard", transportChoice: "imaara-shuttle", accommodationChoice: "guesthouse", emergencyContact: "+254700000001", checkInStatus: "checked_in", attendanceStatus: "attended", source: "member", status: "checked_in" },
  { id: "ereg-mary", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", personId: "person-visitor-mary", categoryId: "ecat-visitor", branchId: "branch-imaara", ageGroup: "adult", paymentStatus: "pending", mealChoice: "standard", transportChoice: "imaara-shuttle", emergencyContact: "+254722000010", checkInStatus: "not_checked_in", attendanceStatus: "registered", source: "public", status: "pending_payment" },
  { id: "ereg-grace-child", tenantId: "tenant-kings-grace", eventId: "event-child-2026", personId: "person-child-grace", categoryId: "ecat-child", branchId: "branch-imaara", ageGroup: "child", householdId: "household-otieno", guardianPersonId: "person-amina", consentId: "consent-child-photo", paymentStatus: "free", mealChoice: "child meal", emergencyContact: "+254700000001", checkInStatus: "checked_in", attendanceStatus: "attended", source: "household", status: "checked_in" },
];

export const eventTickets: EventTicket[] = [
  { id: "eticket-amina", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", registrationId: "ereg-amina", code: "KIC-AMINA-001", qrPayload: "event:event-conference-2026:KIC-AMINA-001", accessLevel: "full_event", issuedAt: "2026-07-21T09:00:00.000Z", expiresAt: "2026-08-24T00:00:00.000Z", transferPolicy: "not_transferable", status: "used" },
  { id: "eticket-child", tenantId: "tenant-kings-grace", eventId: "event-child-2026", registrationId: "ereg-grace-child", code: "CHILD-GRACE-42", qrPayload: "child:event-child-2026:CHILD-GRACE-42", accessLevel: "child", issuedAt: "2026-07-22T09:00:00.000Z", expiresAt: "2026-08-01T15:00:00.000Z", transferPolicy: "not_transferable", status: "issued" },
];

export const eventCheckIns: EventCheckIn[] = [
  { id: "ecin-amina", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", registrationId: "ereg-amina", checkedAt: "2026-08-21T17:35:00.000Z", gate: "Main Gate", checkedByUserId: "user-volunteer", method: "qr", reEntry: false, status: "accepted" },
];

export const eventSpeakers: EventSpeaker[] = [
  { id: "espeaker-joy", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", name: "Rev. Joy Njeri", title: "Guest Minister", organization: "Grace Mission Network", publicBio: "Teacher and mission practitioner.", restrictedContact: "+254711222333", arrival: "2026-08-21T14:00:00.000Z", departure: "2026-08-23T18:00:00.000Z", transportNeed: "Airport pickup", accommodationNeed: "Guesthouse", hospitalityNeed: "Quiet room before sessions", technicalNeeds: ["lapel mic", "confidence monitor"], status: "confirmed" },
];

export const eventRooms: EventRoom[] = [
  { id: "eroom-main", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", name: "Main Auditorium", spaceType: "hall", capacity: 600, setupStyle: "theatre", equipment: ["projector", "sound", "stage"], accessibility: ["wheelchair access"], responsibleTeam: "Protocol", readinessStatus: "ready" },
  { id: "eroom-breakout", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", name: "Breakout Room A", spaceType: "workshop room", capacity: 120, setupStyle: "classroom", equipment: ["screen"], accessibility: ["step-free"], responsibleTeam: "Hospitality", readinessStatus: "issue", issue: "Needs extra chairs" },
  { id: "eroom-child", tenantId: "tenant-kings-grace", eventId: "event-child-2026", name: "Children's Room 1", spaceType: "children_area", capacity: 40, setupStyle: "class circle", equipment: ["mats", "allergy list placeholder"], accessibility: ["guardian desk"], responsibleTeam: "Children", readinessStatus: "ready" },
];

export const eventMealPlans: EventMealPlan[] = [
  { id: "emeal-lunch", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", mealType: "lunch", date: "2026-08-22", servingTime: "13:00", quantity: 520, dietaryNotes: ["vegetarian count pending"], catererPlaceholder: "Approved caterer placeholder", status: "planned" },
  { id: "emeal-child-snack", tenantId: "tenant-kings-grace", eventId: "event-child-2026", mealType: "children snack", date: "2026-08-01", servingTime: "10:30", quantity: 45, dietaryNotes: ["allergies restricted"], catererPlaceholder: "Internal kitchen", status: "ready" },
];

export const accommodationAllocations: EventAccommodationAllocation[] = [
  { id: "eacc-amina", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", registrationId: "ereg-amina", site: "Church Guesthouse", room: "G-02", bed: "1", familyGrouping: false, minorSafeguardingStatus: "not_minor", status: "assigned" },
];

export const transportRoutes: EventTransportRoute[] = [
  { id: "eroute-imaara", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", name: "Imaara Shuttle", pickupPoint: "Imaara Campus", departureTime: "2026-08-21T16:30:00.000Z", returnTime: "2026-08-23T18:30:00.000Z", vehicle: "Bus KCG 123A", driverName: "Driver recorded internally", capacity: 45, status: "boarding" },
];

export const passengerManifests: EventPassengerManifest[] = [
  { id: "eman-amina", tenantId: "tenant-kings-grace", routeId: "eroute-imaara", registrationId: "ereg-amina", boarded: true, disembarked: false, childStatus: "not_child", emergencyContact: "+254700000001" },
  { id: "eman-mary", tenantId: "tenant-kings-grace", routeId: "eroute-imaara", registrationId: "ereg-mary", boarded: false, disembarked: false, childStatus: "not_child", emergencyContact: "+254722000010" },
];

export const eventIncidents: EventIncident[] = [
  { id: "einc-logistics", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", category: "logistics", summary: "Breakout room chair shortage.", routedToSafeguarding: false, status: "open" },
  { id: "einc-child-pickup", tenantId: "tenant-kings-grace", eventId: "event-child-2026", category: "pickup_issue", summary: "Pickup issue recorded safely.", restrictedDetails: "Unauthorized adult attempted pickup with wrong code.", routedToSafeguarding: true, status: "routed" },
];

export const outreachCampaigns: OutreachCampaign[] = [
  { id: "outreach-eastleigh", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", branchId: "branch-imaara", name: "Eastleigh Neighbourhood Outreach", outreachType: "neighbourhood", location: "Eastleigh", date: "2026-08-22", targetArea: "Block 4", leaderUserId: "user-branch", goals: ["Invite responsibly", "Capture consent", "Assign follow-up"], status: "active" },
];

export const outreachContacts: OutreachContact[] = [
  { id: "ocontact-sam", tenantId: "tenant-kings-grace", campaignId: "outreach-eastleigh", name: "Sam K.", phone: "+254744000030", location: "Eastleigh", preferredContact: "phone", consent: true, prayerRequest: "Family", churchInterest: true, programmeInterest: true, fellowshipInterest: true, newConvertStatus: "follow_up_needed", status: "assigned_follow_up" },
  { id: "ocontact-mary", tenantId: "tenant-kings-grace", campaignId: "outreach-eastleigh", personId: "person-visitor-mary", name: "Mary Wairimu", phone: "+254722000010", location: "Imaara", preferredContact: "whatsapp", consent: true, churchInterest: true, programmeInterest: false, fellowshipInterest: true, newConvertStatus: "none", status: "duplicate_review" },
];

export const missionTrips: MissionTrip[] = [
  { id: "mission-kisumu", tenantId: "tenant-kings-grace", branchId: "branch-ruiru", title: "Kisumu Medical and Discipleship Mission", missionType: "medical", destination: "Kisumu", startDate: "2026-09-10", endDate: "2026-09-15", leaderUserId: "user-branch", objectives: ["Training", "Community service", "Discipleship support"], hostChurch: "Kisumu Grace Fellowship", safeguardingLevel: "restricted", emergencyPlan: "Daily check-in and emergency contacts held by mission lead.", status: "approved" },
];

export const missionApplications: MissionApplication[] = [
  { id: "mapp-john", tenantId: "tenant-kings-grace", missionTripId: "mission-kisumu", personId: "person-newconvert-john", prerequisites: ["Foundation class", "Pastoral recommendation"], pastoralRecommendationStatus: "pending", approvalStatus: "submitted", readinessStatus: "training_needed" },
];

export const missionDocuments: MissionDocument[] = [
  { id: "mdoc-john-consent", tenantId: "tenant-kings-grace", missionTripId: "mission-kisumu", personId: "person-newconvert-john", documentType: "consent", storagePath: "restricted/missions/kisumu/john-consent.pdf", restricted: true },
];

export const safeguardingRatioRules: SafeguardingRatioRule[] = [
  { id: "ratio-child-standard", tenantId: "tenant-kings-grace", ageGroup: "children_6_12", minimumAdults: 2, childrenPerAdult: 10, twoAdultRule: true, trainedVolunteerRequired: true },
  { id: "ratio-youth-camp", tenantId: "tenant-kings-grace", ageGroup: "teens_youth", minimumAdults: 4, childrenPerAdult: 12, twoAdultRule: true, trainedVolunteerRequired: true },
];

export const childrenClasses: ChildrenClass[] = [
  { id: "cclass-discovery", tenantId: "tenant-kings-grace", branchId: "branch-imaara", eventId: "event-child-2026", name: "Discovery Class", ageRange: "6-12", roomId: "eroom-child", teacherUserIds: ["user-admin", "user-volunteer"], capacity: 40, safeguardingRuleId: "ratio-child-standard", status: "active" },
];

export const authorizedPickups: AuthorizedPickup[] = [
  { id: "pickup-amina-grace", tenantId: "tenant-kings-grace", childPersonId: "person-child-grace", authorizedPersonId: "person-amina", relationship: "parent", phone: "+254700000001", pickupCode: "GRACE-42", temporaryAuthorization: false, restricted: false },
];

export const childCheckIns: ChildCheckIn[] = [
  { id: "childcin-grace", tenantId: "tenant-kings-grace", childPersonId: "person-child-grace", classId: "cclass-discovery", eventId: "event-child-2026", checkedInAt: "2026-08-01T08:50:00.000Z", checkedInByUserId: "user-admin", pickupCode: "GRACE-42", status: "present" },
];

export const childPickupAttempts: ChildPickupAttempt[] = [
  { id: "pickattempt-failed", tenantId: "tenant-kings-grace", childCheckInId: "childcin-grace", attemptedByPersonId: "person-visitor-mary", codePresented: "WRONG", successful: false, reason: "Code mismatch and person not authorized.", recordedByUserId: "user-admin" },
];

export const youthMinistryRecords: YouthMinistryRecord[] = [
  { id: "youth-john", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", branchId: "branch-ruiru", ageBand: "youth", programmeIds: ["programme-foundations"], mentorUserId: "user-branch", guardianConsentRequired: false, nextStep: "Foundation class and campus fellowship invitation", status: "active" },
];

export const campusFellowships: CampusFellowship[] = [
  { id: "campus-ku", tenantId: "tenant-kings-grace", institution: "Kenyatta University", campus: "Main Campus", fellowshipName: "KGC KU Fellowship", branchId: "branch-ruiru", studentLeaderUserId: "user-volunteer", chaplainUserId: "user-branch", meetingSchedule: "Wednesday 18:00", status: "active" },
];

export const campusTransitions: CampusTransition[] = [
  { id: "ctrans-john", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", campusFellowshipId: "campus-ku", transitionType: "joining", status: "pending" },
];

export const eventReports: EventReport[] = [
  { id: "ereport-conference", tenantId: "tenant-kings-grace", eventId: "event-conference-2026", status: "submitted", attendanceSummary: { registrations: 2, checkIns: 1, firstTimers: 1, newConverts: 1 }, financialSummary: { registrationIncome: 1500, technologyFees: 50, outstandingPayments: 1025, refundsForReview: 0 }, safeIncidentSummary: "One logistics issue. Sensitive child/safeguarding content excluded.", followUpActions: ["Assign Mary to fellowship follow-up", "Invite John to foundation class"] },
];
