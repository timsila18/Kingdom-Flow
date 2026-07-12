export type ServiceStatus = "draft" | "proposed" | "pending_approval" | "approved" | "published" | "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed" | "archived";
export type RosterStatus = "draft" | "assigned" | "notified" | "confirmed" | "declined" | "replacement_requested" | "replaced" | "completed" | "no_show" | "cancelled";

export interface ServiceType {
  id: string;
  tenantId: string;
  key: string;
  displayName: string;
  defaultDurationMinutes: number;
  defaultTemplateId: string;
  requiredDepartmentIds: string[];
  approvalWorkflowId?: string;
  attendanceModel: "summary" | "registered" | "hybrid";
  childCheckInRequired: boolean;
  securityRequired: boolean;
  livestreamRequired: boolean;
  reportingTemplateId: string;
  active: boolean;
}

export interface ChurchService {
  id: string;
  tenantId: string;
  branchId: string;
  organizationUnitId: string;
  serviceTypeId: string;
  title: string;
  theme: string;
  description: string;
  serviceDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  onlineLink?: string;
  expectedAttendance: number;
  capacity: number;
  presidingMinisterUserId: string;
  preacherUserId: string;
  serviceCoordinatorUserId: string;
  worshipLeaderUserId: string;
  branchPastorUserId: string;
  programmeOwnerUserId?: string;
  status: ServiceStatus;
  approvalStatus: "not_required" | "pending" | "approved" | "returned";
  publicationStatus: "private" | "teams" | "public";
  attendanceStatus: "not_started" | "captured" | "submitted";
  reportStatus: "not_started" | "draft" | "submitted" | "reviewed" | "approved" | "locked";
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringServiceSchedule {
  id: string;
  tenantId: string;
  branchId: string;
  serviceTypeId: string;
  recurrence: "weekly" | "fortnightly" | "monthly" | "first_sunday" | "last_friday" | "custom";
  dayAndTime: string;
  defaultVenue: string;
  activeFrom: string;
  pausedDates: string[];
  generatedServiceIds: string[];
}

export interface ServiceTemplate {
  id: string;
  tenantId: string;
  name: string;
  version: number;
  branchId?: string;
  serviceTypeId?: string;
  activeFrom: string;
  approvalRequired: boolean;
  defaultItems: string[];
}

export interface ServicePlanItem {
  id: string;
  tenantId: string;
  serviceId: string;
  title: string;
  itemType: "opening_prayer" | "worship" | "praise" | "scripture" | "welcome" | "testimony" | "choir" | "announcement" | "offering" | "sermon" | "altar_call" | "communion" | "custom";
  startTime: string;
  durationMinutes: number;
  responsibleUserId?: string;
  responsibleDepartmentId?: string;
  notes?: string;
  scripture?: string;
  songId?: string;
  stageCue?: string;
  technicalCue?: string;
  visibility: "teams" | "public" | "restricted";
  status: "draft" | "ready" | "changed" | "completed";
  dependencyItemId?: string;
  contingencyOption?: string;
  sortOrder: number;
}

export interface SermonPlan {
  id: string;
  tenantId: string;
  serviceId: string;
  title: string;
  theme: string;
  scriptureReferences: string[];
  preacherUserId: string;
  seriesId?: string;
  summary: string;
  publicStatus: "private" | "approved_public" | "archived";
  restrictedNotes?: string;
  publicationApproval: "pending" | "approved" | "declined";
}

export interface WorshipSet {
  id: string;
  tenantId: string;
  serviceId: string;
  setType: "praise" | "worship" | "choir" | "special_song" | "instrumental" | "spontaneous_placeholder";
  worshipLeaderUserId: string;
  songs: { songId: string; key: string; tempo: string; order: number }[];
  leadVocalistPersonId?: string;
  backingVocalistPersonIds: string[];
  instrumentalistPersonIds: string[];
  rehearsalNotes: string;
  technicalNotes: string;
  licensingNote: string;
  durationMinutes: number;
}

export interface Song {
  id: string;
  tenantId: string;
  title: string;
  composerOrArtist: string;
  language: string;
  defaultKey: string;
  tempo: string;
  genre: string;
  licensingNote: string;
  lastUsed?: string;
  usageCount: number;
  active: boolean;
}

export interface MusicTeam {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  teamType: "choir" | "praise_team" | "worship_team" | "band" | "instrumentalists" | "vocal_team" | "custom";
  leaderUserId: string;
  assistantLeaderUserId?: string;
  readinessLabel: "Ready" | "Needs rehearsal" | "Leadership follow-up";
  active: boolean;
}

export interface Rehearsal {
  id: string;
  tenantId: string;
  teamId: string;
  serviceId: string;
  date: string;
  time: string;
  venue: string;
  leaderUserId: string;
  songIds: string[];
  equipmentNeeded: string[];
  readinessStatus: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled" | "needs_follow_up";
  notes: string;
}

export interface Department {
  id: string;
  tenantId: string;
  branchId: string;
  parentDepartmentId?: string;
  name: string;
  code: string;
  purpose: string;
  description: string;
  leaderUserId: string;
  deputyUserId?: string;
  administratorUserId?: string;
  membershipRequirements: string[];
  trainingRequirements: string[];
  serviceResponsibilities: string[];
  status: "active" | "inactive" | "archived";
  reportingUnitId: string;
}

export interface VolunteerProfile {
  id: string;
  tenantId: string;
  personId: string;
  userId?: string;
  departmentIds: string[];
  roles: string[];
  skills: string[];
  interests: string[];
  branchId: string;
  inductionStatus: "not_started" | "in_training" | "completed";
  safeguardingClearanceStatus: "placeholder_not_checked" | "pending" | "cleared" | "restricted";
  accessibilityNeeds?: string;
  temporaryUnavailableUntil?: string;
  active: boolean;
}

export interface VolunteerApplication {
  id: string;
  tenantId: string;
  personId: string;
  requestedDepartmentId: string;
  motivation: string;
  availability: string;
  skills: string[];
  branchId: string;
  requiredTraining: string[];
  approvalStatus: "pending" | "approved" | "declined";
  status: "draft" | "submitted" | "under_review" | "approved" | "declined" | "training" | "trial" | "active" | "paused" | "suspended" | "exited";
}

export interface VolunteerAvailability {
  id: string;
  tenantId: string;
  volunteerProfileId: string;
  availableDates: string[];
  unavailableDates: string[];
  preferredServiceIds: string[];
  maximumServicesPerMonth: number;
  recurringAvailability: string;
}

export interface RosterAssignment {
  id: string;
  tenantId: string;
  serviceId: string;
  departmentId: string;
  volunteerProfileId: string;
  role: string;
  station: string;
  shift: string;
  startTime: string;
  endTime: string;
  reportingTime: string;
  supervisorUserId: string;
  status: RosterStatus;
  confirmation: "pending" | "confirmed" | "declined";
  substitutionAssignmentId?: string;
  notes?: string;
}

export interface RosterConflict {
  id: string;
  tenantId: string;
  rosterAssignmentId: string;
  conflictType: "overlap" | "unavailable" | "excessive_workload" | "duplicate_role" | "missing_training" | "wrong_branch" | "suspended" | "safeguarding_missing" | "critical_gap";
  explanation: string;
  severity: "info" | "warning" | "blocking";
  overrideByUserId?: string;
  overrideReason?: string;
}

export interface ReplacementRequest {
  id: string;
  tenantId: string;
  originalAssignmentId: string;
  requestedByProfileId: string;
  reason: string;
  reviewedByUserId?: string;
  replacementAssignmentId?: string;
  status: "requested" | "reviewed" | "replacement_invited" | "accepted" | "declined" | "cancelled";
}

export interface VolunteerCheckIn {
  id: string;
  tenantId: string;
  rosterAssignmentId: string;
  arrivalTime: string;
  method: "qr" | "leader_mark_present" | "self_check_in" | "kiosk" | "manual";
  lateStatus: "on_time" | "late" | "excused_absence" | "no_show";
  completionStatus: "pending" | "completed" | "early_departure";
  supervisorConfirmed: boolean;
}

export interface EquipmentChecklistItem {
  id: string;
  tenantId: string;
  serviceId: string;
  item: string;
  quantity: number;
  departmentId: string;
  responsibleUserId: string;
  readinessStatus: "ready" | "issue" | "missing" | "replacement_needed";
  issue?: string;
  checkedByUserId?: string;
  checkedAt?: string;
  returnedStatus: "not_required" | "pending" | "returned" | "issue";
}

export interface MediaRequest {
  id: string;
  tenantId: string;
  serviceId: string;
  requesterUserId: string;
  assetType: string;
  description: string;
  deadline: string;
  branchId: string;
  assignedDesignerUserId?: string;
  status: "draft" | "submitted" | "approved" | "assigned" | "in_progress" | "review" | "revision" | "completed" | "cancelled";
}

export interface ServiceIncident {
  id: string;
  tenantId: string;
  serviceId: string;
  branchId: string;
  occurredAt: string;
  location: string;
  category: "medical" | "safety" | "security" | "equipment" | "volunteer" | "guest" | "child_safeguarding" | "transport" | "facility" | "technical" | "other";
  summary: string;
  immediateAction: string;
  escalation: "none" | "department_lead" | "pastoral" | "safeguarding" | "medical";
  responsibleLeadUserId: string;
  status: "open" | "assigned" | "resolved" | "restricted";
  restrictedNotes?: string;
}

export interface ServiceReport {
  id: string;
  tenantId: string;
  serviceId: string;
  status: "draft" | "submitted" | "reviewed" | "approved" | "locked";
  submittedByUserId?: string;
  reviewedByUserId?: string;
  attendanceSummary: { total: number; registered: number; visitors: number; firstTimers: number; newConverts: number; children: number; online: number };
  safeReferralSummary: string[];
  departmentReadinessSummary: string;
  technicalIncidentSummary: string;
  nextActions: string[];
}
