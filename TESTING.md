# KingdomFlow pilot verification

The production site is https://kingdomflow.co.ke. Use a small, explicitly temporary church for live verification. Do not put real pastoral, HR, payroll, or giving details into a test church. The app does not seed new demo accounts, but the live Supabase project still contains legacy test accounts that require a separate access review.

## Automated checks

Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before release. GitHub Actions runs the same checks for `main` and pull requests.

The live workflow verifier is `scripts/verify-simple-workflows.mjs`. It creates a disposable platform account when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are not supplied. Set `VERIFY_BASE_URL=https://kingdomflow.co.ke` and provide the existing local Supabase environment variables, then run the script. It creates a temporary church and accounts, checks the seven user types and major journeys, and removes them in `finally`. Do not run it again after a cleanup error until the leftover account is investigated. Never commit credentials, test reports, or `.env` files.

## Church journey

1. Register a church, approve it from Platform Admin, then sign in as its Church Admin.
2. In Settings, create departments, a fellowship, and classes. Mark each class as Foundation or Discipleship, set the sessions required, and publish member-facing classes and departments.
3. Register a new believer from the sign-in page. Confirm that the person is a visitor/new convert in the church workspace, **not** a confirmed member, staff member, or leader.
4. Confirm the allocated Care Worker sees the new person. Record a successful contact and check that the person leaves the uncontacted queue.
5. Enrol the person in Foundation. Record distinct attended session dates, record a passing assessment, then complete training. Verify that enrolment alone and repeated attendance on the same date cannot complete it.
6. Enrol the person in Discipleship and repeat the attendance/assessment process. Connect the person to a fellowship.
7. As the member, request an open department. As a coordinator or Church Admin, review and approve the request. Confirm duties cannot be assigned before approval. Assign a weekly or monthly duty and inspect its upcoming dates in My serving duties.
8. As Church Admin, confirm membership, then add staff through Church HR. Check that an unconfirmed person cannot be added to staff, that employment and volunteer ministry are distinct, and that an HR volunteer is not payroll eligible.
9. Nominate a confirmed person for pastoral leadership. A different church leader or administrator must review the nomination. Confirm leader access cannot be granted before approval or to an unlinked person.

## Boundaries and recovery

- Sign in separately as Platform Admin, Church Admin, Church Leader, Ministry Coordinator, Care Worker, Finance Officer, and Member. Confirm each sees only assigned data and cannot switch to an unassigned role.
- Check that a member cannot open the people directory or edit finance, and that one church cannot view another church's people, care, HR, or finance records. Check this with two disposable churches before public launch.
- Test password reset delivery to a mailbox you control, use the link once, verify the old password stops working, and confirm the new password works. The token/reset logic has automated coverage; actual email delivery is not yet certified.
- Supabase currently reports **no scheduled backups** for the KingdomFlow Free-plan project. Before declaring recovery ready, enable an appropriate backup service, restore a recent backup to a **separate non-production project**, and check tenant, `tenant_settings`, auth, HR, and Storage data. Never restore into production merely to test.
- After rotating credentials, update Vercel Production and local secret stores, redeploy, then check sign-in, `/api/health`, registration, and HR. Do not paste secrets into GitHub or chat.

## Current limitations

The simple workspace is the supported church journey. Legacy people, programmes, and services URLs redirect to it. Some other advanced modules remain separate and have not been certified by this checklist. Email ownership verification is intentionally excluded by the current product decision. A successful build and HTTP 200 health response are not substitutes for the live multi-account checks above.
