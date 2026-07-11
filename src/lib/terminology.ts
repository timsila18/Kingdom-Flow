import { tenantTerminology } from "./data";
import { terminologyDefaults } from "./constants";

export type TerminologyKey = keyof typeof terminologyDefaults;

export function labelFor(tenantId: string, key: TerminologyKey) {
  return tenantTerminology[tenantId as keyof typeof tenantTerminology]?.[key] ?? terminologyDefaults[key];
}
