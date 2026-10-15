# Production operations

## Release

1. Review the exact Git changes. Do not commit `.env.local`, credentials, generated reports, or temporary verification output.
2. Require the GitHub CI check (lint, typecheck, tests, build) to pass for the release commit.
3. Confirm the Supabase migrations used by that commit have been applied to the production project.
4. Deploy the checked commit to Vercel. Record its commit SHA and deployment URL.
5. Smoke-test sign-in, church joining, a restricted workspace, password reset, and `/api/health` against the deployment before promoting it.
6. For an application regression, roll back to the preceding Vercel deployment. Do not reverse a production migration without a tested forward repair.

## Backups and recovery

- The Supabase project owner must verify the current database backup schedule, retention, and restore options in the project dashboard. A successful dashboard badge is not a recovery test.
- Restore a backup into a separate, access-restricted project at least once before relying on it. Confirm tenant counts, membership and journey records, HR records, Supabase Auth accounts, and Storage files. Record the recovery date and elapsed time.
- Include `tenant_settings.regional_settings.workspace`, the `kf_hr_*` tables, Auth, and Storage in the recovery inventory. The workspace JSON has no independent version history, so a database restore may be the only way to recover an accidental overwrite.
- Never test restoration by replacing the production database.

## Secrets

- The database password and Supabase secret key shared outside the secret store must be treated as exposed.
- The project owner rotates the database password and creates a replacement Supabase secret key. Update Vercel Production and local secret stores without printing values in terminal output or committing them.
- Deploy with the replacement values, verify sign-in, writes, and `/api/health`, then revoke the old key. Do not revoke a live credential before the replacement is working.
- If rotation interrupts service, restore the last working secret in Vercel, redeploy, and investigate before retrying.

## Incidents and audit

- Check Vercel function logs, Supabase Auth and PostgREST logs, and `/api/health` separately. A healthy database endpoint does not prove Auth or email delivery is healthy.
- If `scripts/verify-simple-workflows.mjs` fails, inspect and remove any `verification-*` church and `verification-*platform@example.invalid` Auth user. Do not run it again until cleanup is confirmed; a temporary platform user has elevated access.
- Preserve audit records when investigating access, payroll, or church approval incidents. Document the incident timeline and the affected tenant before changing data.
