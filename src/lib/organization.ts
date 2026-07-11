import type { OrganizationUnit } from "./types";

export function wouldCreateCircularParent(units: OrganizationUnit[], unitId: string, proposedParentId?: string) {
  if (!proposedParentId) return false;
  if (unitId === proposedParentId) return true;

  let current = units.find((unit) => unit.id === proposedParentId);
  while (current) {
    if (current.parentId === unitId) return true;
    current = units.find((unit) => unit.id === current?.parentId);
  }

  return false;
}

export function tenantScoped<T extends { tenantId: string }>(rows: T[], tenantId: string) {
  return rows.filter((row) => row.tenantId === tenantId);
}
