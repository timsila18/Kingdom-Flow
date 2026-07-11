# Prompt 4: Pastoral Care, Prayer, Counselling and Welfare

Prompt 4 adds a confidential pastoral-care system that reuses the Prompt 2 authorization, hierarchy and approval foundations and the Prompt 3 people, household and consent records.

## Principles

- Human care first: every record represents a real person, household or family.
- Confidentiality by default: pastoral records are private unless scoped permission and case rules allow access.
- Minimum necessary access: users see only what they need to provide care.
- Consent and dignity: records capture why data is held, who may see it and when it can be shared.
- Safeguarding overrides ordinary confidentiality: urgent escalation can follow church policy and applicable law.
- Technology does not replace professional help: cases can document referrals to qualified professionals or emergency services.
- No spiritual scoring: the module never scores faith, prayer, risk-worthiness or righteousness.
- Private information never becomes public testimony automatically.

## Implemented Areas

- Central pastoral cases with branch, unit, person, household, assignment, status, stage, confidentiality, urgency, risk and closure fields.
- Configurable case categories and confidentiality levels.
- Separate note types with version history, amendment reason, access reason flags and export controls.
- Prayer requests, prayer teams, prayer assignments and prayer follow-up.
- Testimony intake, consent and review workflow.
- Counselling appointments and session records with restricted notes.
- Hospital and pastoral visit workflows.
- Bereavement support with announcement consent and ordinary-message suppression.
- Welfare requests, structured assessment and amount-aware approval decisions.
- Professional referrals with provider verification labels.
- Hierarchical pastoral referrals with selected information sharing and temporary access.
- Dedicated safeguarding cases and actions, separate from ordinary pastoral dashboard/search.
- Case tasks, care plans, timelines, notifications, reports and configuration panels.

## Authorization Model

The module calls the centralized Prompt 2 `can()` authorization function. It distinguishes case existence, case summary, detailed note access, explicit temporary grants, safeguarding permissions, welfare permissions and prayer-team assignment access.

Senior or principal ministry roles can receive metadata and oversight, but they do not gain every intimate note merely because of title. Restricted notes require explicit permission or a time-bound grant.

## Safeguarding

Safeguarding cases use dedicated permissions:

- `safeguarding.case.create`
- `safeguarding.case.view`
- `safeguarding.case.manage`
- `safeguarding.case.refer`
- `safeguarding.case.close`
- `safeguarding.settings.manage`
- `safeguarding.audit.view`

Safeguarding cases are excluded from ordinary pastoral dashboards and search. The system records actions and safe summaries, not legal conclusions.

## Reserved For Later Prompts

- Real SMS, WhatsApp and email delivery.
- Google Calendar synchronization.
- Payment execution and accounting for welfare support.
- Malware scanning implementation for documents.
- Jurisdiction-specific legal policy content beyond tenant-configured contacts and reminders.
