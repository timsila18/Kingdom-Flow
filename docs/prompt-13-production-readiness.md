# Prompt 13: Production Readiness, Billing and Launch Completion

Implemented the production-readiness layer:

- Ethical Monthly Active People billing calculation with protected visitors/new converts and deduplication.
- Three-month average plan recommendation using the launch plan table.
- Subscription invoice foundation separate from church giving and finance.
- Humane grace-period restrictions that preserve care, safeguarding, data access and export.
- Church data export catalogue with sensitive approval requirements.
- Onboarding checklist, feature flags, support tickets/access and tenant offboarding foundations.
- Release readiness gates and platform support boundaries.
- Stewardship commitment and policy surface.

External-live items remain correctly flagged rather than faked:

- Live M-Pesa subscription collection needs production credentials.
- Solco production delivery remains feature-flagged until live credentials are configured.
- Remote GitHub push and Vercel deployment depend on available sandbox/network approval.
