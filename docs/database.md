# Database Schema

The initial migration is `supabase/migrations/20260711150720_platform_foundation.sql`.

Core tables include `profiles`, `platform_roles`, `platform_user_roles`, `tenants`, `tenant_settings`, `tenant_branding`, `tenant_terminology`, `tenant_memberships`, `organization_unit_types`, `organization_units`, `branches`, `roles`, `permissions`, `role_permissions`, `permission_scopes`, `user_role_assignments`, `invitations`, `subscription_plans`, `plan_features`, `tenant_subscriptions`, `billing_contacts`, `invoices`, `payments`, `subscription_events`, `feature_flags`, `files`, `audit_logs`, `onboarding_progress`, `notifications` and `user_preferences`.

The schema uses UUID primary keys, foreign keys, indexes, archival fields, RLS and append-only audit records.
