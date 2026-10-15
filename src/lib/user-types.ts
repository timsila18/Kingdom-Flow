export const userTypes = {
  platform_admin: "Platform Admin",
  church_admin: "Church Admin",
  church_leader: "Church Leader",
  ministry_coordinator: "Ministry Coordinator",
  care_worker: "Care & Follow-up Worker",
  finance_officer: "Finance Officer",
  member: "Member",
} as const;
export type UserType = keyof typeof userTypes;
export type ChurchUserType = Exclude<UserType, "platform_admin">;
export function isChurchUserType(value: string): value is ChurchUserType {
  return value !== "platform_admin" && value in userTypes;
}
export const roleSections: Record<ChurchUserType, readonly string[]> = {
  church_admin: [
    "people",
    "follow-up",
    "departments",
    "groups",
    "classes",
    "events",
    "attendance",
    "duties",
    "team",
    "settings",
    "reports",
    "decisions",
    "branches",
  ],
  church_leader: [
    "people",
    "decisions",
    "reports",
    "events",
    "departments",
    "classes",
    "groups",
  ],
  ministry_coordinator: [
    "people",
    "departments",
    "groups",
    "classes",
    "events",
    "attendance",
    "duties",
    "reports",
  ],
  care_worker: ["people", "follow-up", "care", "visits", "prayer"],
  finance_officer: ["giving", "expenses", "receipts", "reports"],
  member: ["my-classes", "my-service", "events", "prayer", "profile", "my-duties"],
};
