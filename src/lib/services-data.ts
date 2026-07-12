import type {
  ChurchService,
  Department,
  EquipmentChecklistItem,
  MediaRequest,
  MusicTeam,
  RecurringServiceSchedule,
  Rehearsal,
  ReplacementRequest,
  RosterAssignment,
  RosterConflict,
  SermonPlan,
  ServiceIncident,
  ServicePlanItem,
  ServiceReport,
  ServiceTemplate,
  ServiceType,
  Song,
  VolunteerApplication,
  VolunteerAvailability,
  VolunteerCheckIn,
  VolunteerProfile,
  WorshipSet,
} from "./services-types";

export const departments: Department[] = [
  { id: "dept-worship", tenantId: "tenant-kings-grace", branchId: "branch-imaara", name: "Worship", code: "WOR", purpose: "Lead congregational worship.", description: "Choir, worship team and band coordination.", leaderUserId: "user-branch", deputyUserId: "user-volunteer", membershipRequirements: ["active member or approved trainee"], trainingRequirements: ["worship induction"], serviceResponsibilities: ["worship set", "rehearsal", "stage readiness"], status: "active", reportingUnitId: "unit-imaara" },
  { id: "dept-media", tenantId: "tenant-kings-grace", branchId: "branch-imaara", name: "Media", code: "MED", purpose: "Projection, sound and digital service support.", description: "Sound, projection, livestream placeholder and media assets.", leaderUserId: "user-admin", membershipRequirements: ["training required"], trainingRequirements: ["media induction", "equipment safety"], serviceResponsibilities: ["projection", "sound", "technical cues"], status: "active", reportingUnitId: "unit-imaara" },
  { id: "dept-ushers", tenantId: "tenant-kings-grace", branchId: "branch-imaara", name: "Ushers", code: "USH", purpose: "Welcome, seating and service flow.", description: "Entrance, seating, visitor desk and offering support.", leaderUserId: "user-branch", membershipRequirements: ["approved volunteer"], trainingRequirements: ["usher induction"], serviceResponsibilities: ["entrance", "seating", "visitor desk"], status: "active", reportingUnitId: "unit-imaara" },
  { id: "dept-security", tenantId: "tenant-kings-grace", branchId: "branch-imaara", name: "Security", code: "SEC", purpose: "Safety and incident response.", description: "Entry points, emergency readiness and restricted incident routing.", leaderUserId: "user-admin", membershipRequirements: ["approved team"], trainingRequirements: ["safety briefing"], serviceResponsibilities: ["entry points", "incident escalation"], status: "active", reportingUnitId: "unit-imaara" },
];

export const serviceTypes: ServiceType[] = [
  { id: "stype-sunday", tenantId: "tenant-kings-grace", key: "sunday_service", displayName: "Sunday Service", defaultDurationMinutes: 120, defaultTemplateId: "template-main-sunday", requiredDepartmentIds: ["dept-worship", "dept-media", "dept-ushers", "dept-security"], approvalWorkflowId: "workflow-service-standard", attendanceModel: "hybrid", childCheckInRequired: true, securityRequired: true, livestreamRequired: true, reportingTemplateId: "sreport-standard", active: true },
  { id: "stype-prayer", tenantId: "tenant-kings-grace", key: "prayer_service", displayName: "Prayer Service", defaultDurationMinutes: 90, defaultTemplateId: "template-prayer-night", requiredDepartmentIds: ["dept-worship", "dept-ushers"], approvalWorkflowId: "workflow-service-standard", attendanceModel: "summary", childCheckInRequired: false, securityRequired: false, livestreamRequired: false, reportingTemplateId: "sreport-standard", active: true },
];

export const services: ChurchService[] = [
  { id: "service-sunday-20260719", tenantId: "tenant-kings-grace", branchId: "branch-imaara", organizationUnitId: "unit-imaara", serviceTypeId: "stype-sunday", title: "Sunday Celebration Service", theme: "Serving with Grace", description: "Main Sunday worship service.", serviceDate: "2026-07-19", startTime: "09:00", endTime: "11:00", venue: "Imaara Campus Auditorium", onlineLink: "livestream adapter placeholder", expectedAttendance: 420, capacity: 450, presidingMinisterUserId: "user-admin", preacherUserId: "user-admin", serviceCoordinatorUserId: "user-branch", worshipLeaderUserId: "user-branch", branchPastorUserId: "user-branch", status: "published", approvalStatus: "approved", publicationStatus: "teams", attendanceStatus: "captured", reportStatus: "submitted", createdBy: "user-admin", updatedBy: "user-branch", createdAt: "2026-07-12T08:00:00.000Z", updatedAt: "2026-07-12T08:30:00.000Z" },
  { id: "service-prayer-20260722", tenantId: "tenant-kings-grace", branchId: "branch-imaara", organizationUnitId: "unit-imaara", serviceTypeId: "stype-prayer", title: "Midweek Prayer", theme: "Prayer and Care", description: "Branch prayer service.", serviceDate: "2026-07-22", startTime: "18:00", endTime: "19:30", venue: "Imaara Chapel", expectedAttendance: 120, capacity: 180, presidingMinisterUserId: "user-branch", preacherUserId: "user-branch", serviceCoordinatorUserId: "user-volunteer", worshipLeaderUserId: "user-volunteer", branchPastorUserId: "user-branch", status: "scheduled", approvalStatus: "approved", publicationStatus: "teams", attendanceStatus: "not_started", reportStatus: "not_started", createdBy: "user-branch", updatedBy: "user-branch", createdAt: "2026-07-12T08:00:00.000Z", updatedAt: "2026-07-12T08:30:00.000Z" },
];

export const recurringServiceSchedules: RecurringServiceSchedule[] = [
  { id: "sched-imaara-sunday", tenantId: "tenant-kings-grace", branchId: "branch-imaara", serviceTypeId: "stype-sunday", recurrence: "weekly", dayAndTime: "Sunday 09:00", defaultVenue: "Imaara Campus Auditorium", activeFrom: "2026-07-01", pausedDates: ["2026-08-16"], generatedServiceIds: ["service-sunday-20260719"] },
];

export const serviceTemplates: ServiceTemplate[] = [
  { id: "template-main-sunday", tenantId: "tenant-kings-grace", name: "Main Sunday Service", version: 1, branchId: "branch-imaara", serviceTypeId: "stype-sunday", activeFrom: "2026-07-01", approvalRequired: true, defaultItems: ["Opening Prayer", "Praise", "Worship", "Announcements", "Offering", "Sermon", "Closing Prayer"] },
];

export const servicePlanItems: ServicePlanItem[] = [
  { id: "sitem-opening", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", title: "Opening Prayer", itemType: "opening_prayer", startTime: "09:00", durationMinutes: 5, responsibleUserId: "user-branch", responsibleDepartmentId: "dept-ushers", scripture: "Psalm 100", visibility: "teams", status: "ready", sortOrder: 1 },
  { id: "sitem-worship", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", title: "Praise and Worship", itemType: "worship", startTime: "09:05", durationMinutes: 30, responsibleUserId: "user-branch", responsibleDepartmentId: "dept-worship", songId: "song-grace", stageCue: "Band ready", technicalCue: "Lyrics lower third", visibility: "teams", status: "ready", sortOrder: 2 },
  { id: "sitem-sermon", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", title: "Sermon", itemType: "sermon", startTime: "10:00", durationMinutes: 40, responsibleUserId: "user-admin", responsibleDepartmentId: "dept-media", scripture: "Romans 12:6-8", technicalCue: "Sermon slide deck", visibility: "teams", status: "ready", sortOrder: 3 },
];

export const sermonPlans: SermonPlan[] = [
  { id: "sermon-serving-grace", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", title: "Serving with Grace", theme: "Ministry service", scriptureReferences: ["Romans 12:6-8"], preacherUserId: "user-admin", summary: "Public summary approved; private notes remain optional.", publicStatus: "approved_public", restrictedNotes: "Restricted pastor note", publicationApproval: "approved" },
];

export const songs: Song[] = [
  { id: "song-grace", tenantId: "tenant-kings-grace", title: "Grace Song", composerOrArtist: "Church arrangement", language: "en", defaultKey: "G", tempo: "medium", genre: "worship", licensingNote: "Metadata only; lyrics require church-owned upload.", lastUsed: "2026-07-12", usageCount: 3, active: true },
  { id: "song-thanksgiving", tenantId: "tenant-kings-grace", title: "Thanksgiving Chorus", composerOrArtist: "Traditional metadata", language: "sw", defaultKey: "F", tempo: "upbeat", genre: "praise", licensingNote: "Confirm licensing before public projection.", usageCount: 1, active: true },
];

export const worshipSets: WorshipSet[] = [
  { id: "wset-sunday", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", setType: "worship", worshipLeaderUserId: "user-branch", songs: [{ songId: "song-grace", key: "G", tempo: "medium", order: 1 }, { songId: "song-thanksgiving", key: "F", tempo: "upbeat", order: 2 }], leadVocalistPersonId: "person-david", backingVocalistPersonIds: ["person-amina"], instrumentalistPersonIds: ["person-david"], rehearsalNotes: "Transitions and endings.", technicalNotes: "Projection needs song metadata only.", licensingNote: "No unauthorized lyrics stored.", durationMinutes: 30 },
];

export const musicTeams: MusicTeam[] = [
  { id: "music-worship-team", tenantId: "tenant-kings-grace", branchId: "branch-imaara", name: "Imaara Worship Team", teamType: "worship_team", leaderUserId: "user-branch", assistantLeaderUserId: "user-volunteer", readinessLabel: "Needs rehearsal", active: true },
];

export const rehearsals: Rehearsal[] = [
  { id: "rehearsal-sunday", tenantId: "tenant-kings-grace", teamId: "music-worship-team", serviceId: "service-sunday-20260719", date: "2026-07-18", time: "16:00", venue: "Imaara Auditorium", leaderUserId: "user-branch", songIds: ["song-grace", "song-thanksgiving"], equipmentNeeded: ["Microphones", "Keyboard", "Projector"], readinessStatus: "needs_follow_up", notes: "Projector cable issue logged." },
];

export const volunteerProfiles: VolunteerProfile[] = [
  { id: "vol-david", tenantId: "tenant-kings-grace", personId: "person-david", userId: "user-branch", departmentIds: ["dept-worship", "dept-ushers"], roles: ["worship_leader", "usher_lead"], skills: ["vocal", "pastoral hosting"], interests: ["worship", "welcome"], branchId: "branch-imaara", inductionStatus: "completed", safeguardingClearanceStatus: "placeholder_not_checked", active: true },
  { id: "vol-amina", tenantId: "tenant-kings-grace", personId: "person-amina", userId: "user-admin", departmentIds: ["dept-media", "dept-security"], roles: ["media_lead", "security_lead"], skills: ["projection", "service coordination"], interests: ["media", "operations"], branchId: "branch-imaara", inductionStatus: "completed", safeguardingClearanceStatus: "placeholder_not_checked", active: true },
  { id: "vol-mary", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", departmentIds: ["dept-media"], roles: ["trainee"], skills: ["design interest"], interests: ["media"], branchId: "branch-imaara", inductionStatus: "in_training", safeguardingClearanceStatus: "pending", active: true },
];

export const volunteerApplications: VolunteerApplication[] = [
  { id: "vapp-mary-media", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", requestedDepartmentId: "dept-media", motivation: "Wants to support projection after training.", availability: "Sundays", skills: ["design"], branchId: "branch-imaara", requiredTraining: ["media induction"], approvalStatus: "approved", status: "training" },
];

export const volunteerAvailability: VolunteerAvailability[] = [
  { id: "avail-david", tenantId: "tenant-kings-grace", volunteerProfileId: "vol-david", availableDates: ["2026-07-19"], unavailableDates: ["2026-07-26"], preferredServiceIds: ["service-sunday-20260719"], maximumServicesPerMonth: 3, recurringAvailability: "First and third Sundays" },
  { id: "avail-mary", tenantId: "tenant-kings-grace", volunteerProfileId: "vol-mary", availableDates: ["2026-07-19"], unavailableDates: [], preferredServiceIds: ["service-sunday-20260719"], maximumServicesPerMonth: 2, recurringAvailability: "Sundays after training" },
];

export const rosterAssignments: RosterAssignment[] = [
  { id: "rost-worship-david", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", departmentId: "dept-worship", volunteerProfileId: "vol-david", role: "Worship Leader", station: "Stage", shift: "Main service", startTime: "09:00", endTime: "11:00", reportingTime: "08:00", supervisorUserId: "user-admin", status: "confirmed", confirmation: "confirmed", notes: "Uniform: dark smart casual." },
  { id: "rost-media-amina", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", departmentId: "dept-media", volunteerProfileId: "vol-amina", role: "Projection Lead", station: "Media desk", shift: "Main service", startTime: "08:30", endTime: "11:15", reportingTime: "08:00", supervisorUserId: "user-admin", status: "confirmed", confirmation: "confirmed" },
  { id: "rost-usher-david", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", departmentId: "dept-ushers", volunteerProfileId: "vol-david", role: "Entrance Lead", station: "Main door", shift: "Arrival", startTime: "08:30", endTime: "09:30", reportingTime: "08:10", supervisorUserId: "user-branch", status: "replacement_requested", confirmation: "declined", notes: "Replacement requested due sermon prep." },
];

export const rosterConflicts: RosterConflict[] = [
  { id: "conflict-david-overlap", tenantId: "tenant-kings-grace", rosterAssignmentId: "rost-usher-david", conflictType: "overlap", explanation: "David is already worship leader during the same service window.", severity: "warning" },
  { id: "conflict-media-training", tenantId: "tenant-kings-grace", rosterAssignmentId: "rost-media-amina", conflictType: "critical_gap", explanation: "Media trainee still requires supervised trial before solo projection.", severity: "info" },
];

export const replacementRequests: ReplacementRequest[] = [
  { id: "replace-usher-david", tenantId: "tenant-kings-grace", originalAssignmentId: "rost-usher-david", requestedByProfileId: "vol-david", reason: "Assigned to preach support and worship leadership.", reviewedByUserId: "user-branch", status: "replacement_invited" },
];

export const volunteerCheckIns: VolunteerCheckIn[] = [
  { id: "checkin-worship-david", tenantId: "tenant-kings-grace", rosterAssignmentId: "rost-worship-david", arrivalTime: "2026-07-19T08:03:00.000Z", method: "qr", lateStatus: "on_time", completionStatus: "completed", supervisorConfirmed: true },
  { id: "checkin-media-amina", tenantId: "tenant-kings-grace", rosterAssignmentId: "rost-media-amina", arrivalTime: "2026-07-19T08:12:00.000Z", method: "leader_mark_present", lateStatus: "late", completionStatus: "completed", supervisorConfirmed: true },
];

export const equipmentChecklistItems: EquipmentChecklistItem[] = [
  { id: "equip-projector", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", item: "Projector cable", quantity: 1, departmentId: "dept-media", responsibleUserId: "user-admin", readinessStatus: "issue", issue: "HDMI cable flicker; replacement needed.", checkedByUserId: "user-admin", checkedAt: "2026-07-18T16:30:00.000Z", returnedStatus: "not_required" },
  { id: "equip-microphones", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", item: "Wireless microphones", quantity: 4, departmentId: "dept-media", responsibleUserId: "user-admin", readinessStatus: "ready", checkedByUserId: "user-admin", checkedAt: "2026-07-18T16:20:00.000Z", returnedStatus: "pending" },
];

export const mediaRequests: MediaRequest[] = [
  { id: "media-sermon-slide", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", requesterUserId: "user-admin", assetType: "sermon artwork", description: "Title slide for Serving with Grace.", deadline: "2026-07-18T12:00:00.000Z", branchId: "branch-imaara", assignedDesignerUserId: "user-volunteer", status: "review" },
];

export const serviceIncidents: ServiceIncident[] = [
  { id: "incident-projector", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", branchId: "branch-imaara", occurredAt: "2026-07-19T09:20:00.000Z", location: "Media desk", category: "technical", summary: "Projection flicker during worship.", immediateAction: "Switched cable and used backup laptop.", escalation: "department_lead", responsibleLeadUserId: "user-admin", status: "assigned", restrictedNotes: "Internal technical details only." },
  { id: "incident-child-safe", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", branchId: "branch-imaara", occurredAt: "2026-07-19T10:05:00.000Z", location: "Children check-in", category: "child_safeguarding", summary: "Safeguarding metadata routed to restricted care system.", immediateAction: "Escalated to safeguarding lead.", escalation: "safeguarding", responsibleLeadUserId: "user-admin", status: "restricted", restrictedNotes: "Restricted; details live in Prompt 4 system." },
];

export const serviceReports: ServiceReport[] = [
  { id: "sreport-sunday", tenantId: "tenant-kings-grace", serviceId: "service-sunday-20260719", status: "submitted", submittedByUserId: "user-branch", attendanceSummary: { total: 386, registered: 310, visitors: 18, firstTimers: 7, newConverts: 2, children: 45, online: 68 }, safeReferralSummary: ["Two confidential pastoral referrals submitted"], departmentReadinessSummary: "Worship ready; media had cable issue; ushers replacement pending.", technicalIncidentSummary: "Projection cable issue resolved with fallback.", nextActions: ["Replace HDMI cable", "Follow up first-timers", "Confirm usher replacement policy"] },
];
