# KingdomFlow

KingdomFlow is a standalone Church Ministry, Discipleship, Member Care, Growth and Operations Operating System foundation.

This repository contains Prompt 1 of 13: platform foundation, multi-tenancy, church onboarding, organizational structure, subscription foundations, audit foundations and a premium responsive design system.

## Stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- Supabase PostgreSQL/Auth/Storage architecture
- Zod validation
- React Hook Form-ready forms
- TanStack Table-ready admin tables
- Recharts-ready dashboard widgets
- Vitest and Playwright

## Run Locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Supabase

Create the local database and apply migrations:

```bash
supabase start
supabase db reset
```

Grant the initial platform owner after the Supabase Auth user for `timsila18@gmail.com` exists:

```sql
insert into public.platform_user_roles (user_id, platform_role_id)
select p.id, r.id
from public.profiles p
cross join public.platform_roles r
where p.email = 'timsila18@gmail.com'
  and r.key = 'platform_super_admin';
```

## Documentation

- `docs/architecture.md`
- `docs/authorization.md`
- `docs/database.md`
- `docs/setup.md`
- `docs/roadmap.md`

## Product Principles

- Every person matters.
- Church autonomy.
- Denomination neutrality.
- Spiritual boundaries.
- Financial integrity.
- Privacy by design.
- Configuration with safeguards.
