import { z } from "zod";

export const churchIdentitySchema = z.object({
  ministryName: z.string().min(2),
  churchType: z.string().min(2),
  publicName: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  country: z.string().min(2),
  region: z.string().min(2),
  physicalLocation: z.string().min(3),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(7),
  website: z.string().url().optional().or(z.literal("")),
});

export const invitationSchema = z.object({
  email: z.string().email(),
  roleId: z.string().uuid().or(z.string().min(3)),
  scopeType: z.enum(["tenant", "branch", "unit"]),
  welcomeMessage: z.string().max(500).optional(),
});

export const organizationUnitSchema = z.object({
  tenantId: z.string().min(3),
  parentId: z.string().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  unitType: z.string().min(2),
});
