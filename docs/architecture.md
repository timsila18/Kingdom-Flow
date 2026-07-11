# KingdomFlow Architecture

KingdomFlow is a standalone Next.js App Router project with a Supabase PostgreSQL foundation. The app is organized by presentation routes, reusable UI primitives, domain helpers, validation, authorization and database migrations.

Prompt 1 creates foundations for platform administration, church tenancy and onboarding, organizational structure, branch profiles, scoped roles and permissions, terminology, branding, subscription plans, notifications, files and audit logs.

All tenant-owned tables include `tenant_id`. UI filtering is never treated as the security boundary; Supabase RLS helpers and server-side authorization are the intended enforcement layer.
