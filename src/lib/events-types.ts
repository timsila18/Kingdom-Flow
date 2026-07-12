export type EventStatus = "draft" | "proposed" | "pending_approval" | "approved" | "published" | "registration_open" | "registration_closed" | "in_preparation" | "in_progress" | "completed" | "postponed" | "cancelled" | "archived";
export type RegistrationStatus = "draft" | "submitted" | "pending_approval" | "pending_payment" | "confirmed" | "waitlisted" | "cancelled" | "refunded" | "checked_in" | "completed" | "no_show";

export interface EventType {
  id: string;
  tenantId: string;
  key: string;
  displayName: string;
  defaultTicketingMode: "free" | "paid" | "invite_only" | "donation_supported";
  guardianConsentRequired: boolean;
  safeguardingLevel: "standard" | "elevated" | "minor_required" | "restricted";
  speakerRequired: boolean;
  volunteerRequired: boolean;
  transportRequired: boolean;
  accommodationRequired: boolean;
  mealRequired: boolean;
  checkInMethod: "qr" | "search" | "manual" | "hybrid";
  active: boolean;
}

export interface MinistryEvent {
  id: string;
  tenantId: string;
  branchId: string;
  organizationUnitId: string;
  eventTypeId: string;
  title: string;
  subtitle?: string;
  description: string;
  theme: string;
  objectives: string[];
  targetAudience: string[];
  ageGroup: "children" | "teens" | "youth" | "adult" | "all";
  venue: string;
  city: string;
  onlineHybridStatus: "onsite" | "online" | "hybrid";
  startDate: string;
  endDate: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  capacity: number;
  expectedAttendance: number;
  ownerUserId: string;
  coordinatorUserId: string;
  presidingMinisterUserId?: string;
  approvalStatus: "draft" | "pending" | "approved" | "returned";
  publicationStatus: "private" | "approved_public" | "public";
  registrationStatus: "not_open" | "open" | "paused" | "closed";
  paymentStatus: "free" | "not_started" | "collecting" | "reconciliation_pending" | "verified";
  safeguardingLevel: EventType["safeguardingLevel"];
  securityLevel: "standard" | "elevated" | "restricted";
  transportRequired: boolean;
  accommodationRequired: boolean;
  mealsRequired: boolean;
  status: EventStatus;
}

export interface EventTeamAssignment {
  id: string;
  tenantId: string;
  eventId: string;
  userId: string;
  role: string;
  scope: "event" | "session" | "children_area" | "transport" | "accommodation";
  startsAt: string;
  endsAt: string;
  permissions: string[];
  status: "active" | "ended";
}

export interface EventSession {
  id: string;
  tenantId: string;
  eventId: string;
  title: string;
  sessionType: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  speakerId?: string;
  facilitatorUserId?: string;
  capacity: number;
  targetAudience: string[];
  registrationRequired: boolean;
  checkInRequired: boolean;
  status: "planned" | "ready" | "completed" | "cancelled";
}

export interface EventRegistrationCategory {
  id: string;
  tenantId: string;
  eventId: string;
  name: string;
  capacity: number;
  price: number;
  technologyFee: number;
  providerFee: number;
  eligibility: string;
  ageGroup: string;
  approvalRequired: boolean;
  mealEligible: boolean;
  accommodationEligible: boolean;
  transportEligible: boolean;
}

export interface EventRegistration {
  id: string;
  tenantId: string;
  eventId: string;
  personId: string;
  categoryId: string;
  branchId: string;
  ageGroup: string;
  householdId?: string;
  guardianPersonId?: string;
  consentId?: string;
  paymentStatus: "free" | "pending" | "verified" | "refund_review";
  accommodationChoice?: string;
  transportChoice?: string;
  mealChoice?: string;
  accessibilityNeeds?: string;
  emergencyContact: string;
  checkInStatus: "not_checked_in" | "checked_in" | "checked_out";
  attendanceStatus: "registered" | "attended" | "no_show" | "completed";
  source: "public" | "member" | "household" | "group" | "leader_nomination" | "walk_in";
  status: RegistrationStatus;
}

export interface EventTicket {
  id: string;
  tenantId: string;
  eventId: string;
  registrationId: string;
  code: string;
  qrPayload: string;
  accessLevel: "full_event" | "day" | "session" | "volunteer" | "speaker" | "child";
  issuedAt: string;
  expiresAt: string;
  transferPolicy: "not_transferable" | "approval_required" | "allowed";
  status: "issued" | "used" | "void" | "expired";
}

export interface EventCheckIn {
  id: string;
  tenantId: string;
  eventId: string;
  registrationId: string;
  checkedAt: string;
  gate: string;
  checkedByUserId: string;
  method: "qr" | "search" | "manual" | "offline_sync";
  reEntry: boolean;
  status: "accepted" | "duplicate" | "denied";
  deniedReason?: string;
}

export interface EventSpeaker {
  id: string;
  tenantId: string;
  eventId: string;
  name: string;
  title: string;
  organization: string;
  publicBio: string;
  restrictedContact: string;
  arrival: string;
  departure: string;
  transportNeed: string;
  accommodationNeed: string;
  hospitalityNeed: string;
  technicalNeeds: string[];
  status: "invited" | "confirmed" | "arrived" | "completed";
}

export interface EventRoom {
  id: string;
  tenantId: string;
  eventId: string;
  name: string;
  spaceType: string;
  capacity: number;
  setupStyle: string;
  equipment: string[];
  accessibility: string[];
  responsibleTeam: string;
  readinessStatus: "ready" | "issue" | "not_started";
  issue?: string;
}

export interface EventMealPlan {
  id: string;
  tenantId: string;
  eventId: string;
  mealType: string;
  date: string;
  servingTime: string;
  quantity: number;
  dietaryNotes: string[];
  catererPlaceholder: string;
  status: "planned" | "ready" | "served";
}

export interface EventAccommodationAllocation {
  id: string;
  tenantId: string;
  eventId: string;
  registrationId: string;
  site: string;
  room: string;
  bed: string;
  checkInAt?: string;
  checkOutAt?: string;
  familyGrouping: boolean;
  minorSafeguardingStatus: "not_minor" | "guardian_linked" | "blocked";
  status: "assigned" | "checked_in" | "checked_out" | "cancelled";
}

export interface EventTransportRoute {
  id: string;
  tenantId: string;
  eventId: string;
  name: string;
  pickupPoint: string;
  departureTime: string;
  returnTime: string;
  vehicle: string;
  driverName: string;
  capacity: number;
  status: "planned" | "boarding" | "departed" | "returned";
}

export interface EventPassengerManifest {
  id: string;
  tenantId: string;
  routeId: string;
  registrationId: string;
  boarded: boolean;
  disembarked: boolean;
  childStatus: "not_child" | "guardian_linked" | "requires_guardian";
  emergencyContact: string;
}

export interface EventIncident {
  id: string;
  tenantId: string;
  eventId: string;
  category: "medical" | "security" | "safeguarding" | "pickup_issue" | "logistics" | "other";
  summary: string;
  restrictedDetails?: string;
  routedToSafeguarding: boolean;
  status: "open" | "routed" | "closed";
}

export interface OutreachCampaign {
  id: string;
  tenantId: string;
  eventId?: string;
  branchId: string;
  name: string;
  outreachType: string;
  location: string;
  date: string;
  targetArea: string;
  leaderUserId: string;
  goals: string[];
  status: "planned" | "active" | "reported" | "archived";
}

export interface OutreachContact {
  id: string;
  tenantId: string;
  campaignId: string;
  personId?: string;
  name: string;
  phone?: string;
  location: string;
  preferredContact: string;
  consent: boolean;
  prayerRequest?: string;
  churchInterest: boolean;
  programmeInterest: boolean;
  fellowshipInterest: boolean;
  newConvertStatus: "none" | "recorded" | "follow_up_needed";
  status: "captured" | "duplicate_review" | "assigned_follow_up";
}

export interface MissionTrip {
  id: string;
  tenantId: string;
  branchId: string;
  title: string;
  missionType: string;
  destination: string;
  startDate: string;
  endDate: string;
  leaderUserId: string;
  objectives: string[];
  hostChurch?: string;
  safeguardingLevel: EventType["safeguardingLevel"];
  emergencyPlan: string;
  status: "proposed" | "approved" | "in_progress" | "reported" | "cancelled";
}

export interface MissionApplication {
  id: string;
  tenantId: string;
  missionTripId: string;
  personId: string;
  prerequisites: string[];
  pastoralRecommendationStatus: "pending" | "approved" | "declined";
  approvalStatus: "submitted" | "approved" | "declined";
  readinessStatus: "training_needed" | "ready" | "blocked";
}

export interface MissionDocument {
  id: string;
  tenantId: string;
  missionTripId: string;
  personId: string;
  documentType: string;
  storagePath: string;
  restricted: boolean;
}

export interface ChildrenClass {
  id: string;
  tenantId: string;
  branchId: string;
  eventId?: string;
  name: string;
  ageRange: string;
  roomId: string;
  teacherUserIds: string[];
  capacity: number;
  safeguardingRuleId: string;
  status: "active" | "paused";
}

export interface AuthorizedPickup {
  id: string;
  tenantId: string;
  childPersonId: string;
  authorizedPersonId: string;
  relationship: string;
  phone: string;
  pickupCode: string;
  temporaryAuthorization: boolean;
  expiresAt?: string;
  restricted: boolean;
}

export interface ChildCheckIn {
  id: string;
  tenantId: string;
  childPersonId: string;
  classId: string;
  eventId?: string;
  checkedInAt: string;
  checkedInByUserId: string;
  pickupCode: string;
  status: "present" | "checked_out" | "incident";
}

export interface ChildPickupAttempt {
  id: string;
  tenantId: string;
  childCheckInId: string;
  attemptedByPersonId: string;
  codePresented: string;
  successful: boolean;
  reason: string;
  recordedByUserId: string;
}

export interface SafeguardingRatioRule {
  id: string;
  tenantId: string;
  ageGroup: string;
  minimumAdults: number;
  childrenPerAdult: number;
  twoAdultRule: boolean;
  trainedVolunteerRequired: boolean;
}

export interface YouthMinistryRecord {
  id: string;
  tenantId: string;
  personId: string;
  branchId: string;
  ageBand: "teen" | "youth";
  programmeIds: string[];
  mentorUserId?: string;
  guardianConsentRequired: boolean;
  nextStep: string;
  status: "active" | "transitioning" | "alumni";
}

export interface CampusFellowship {
  id: string;
  tenantId: string;
  institution: string;
  campus: string;
  fellowshipName: string;
  branchId: string;
  studentLeaderUserId: string;
  chaplainUserId: string;
  meetingSchedule: string;
  status: "active" | "paused";
}

export interface CampusTransition {
  id: string;
  tenantId: string;
  personId: string;
  campusFellowshipId: string;
  transitionType: "joining" | "transferring" | "graduating" | "returning_home" | "alumni";
  status: "pending" | "completed";
}

export interface EventReport {
  id: string;
  tenantId: string;
  eventId: string;
  status: "draft" | "submitted" | "reviewed" | "approved";
  attendanceSummary: { registrations: number; checkIns: number; firstTimers: number; newConverts: number };
  financialSummary: { registrationIncome: number; technologyFees: number; outstandingPayments: number; refundsForReview: number };
  safeIncidentSummary: string;
  followUpActions: string[];
}
