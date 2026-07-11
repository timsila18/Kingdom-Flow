# Prompt 2 Authority, Governance and Approval System

Prompt 2 adds the reusable authority system every later KingdomFlow module must call.

## Role And Permission Catalogue

Permissions use stable keys grouped by module. Role display names are tenant-facing labels only; titles such as Bishop, Administrator or Treasurer do not grant authority unless configured permissions and scopes are assigned.

The role builder surfaces dependency warnings, sensitive permission warnings and separation-of-duties warnings.

## Scope Model

Assignments support tenant, organizational unit, unit descendants, branch, branch descendants, department, programme, small group, assigned records and self scopes. Scope resolution lives in `src/lib/authority-engine.ts` and must not be reimplemented by future modules.

## Hierarchy And Referrals

Leadership positions and assignments model pastoral reporting lines, acting leaders, vacancies and referral receivers. Cycle prevention is implemented in the domain service and reinforced by database constraints.

## Delegation And Acting Authority

Delegations are scoped, time-bound, approved and auditable. Acting appointments inherit only selected permissions and expire independently.

## Approval Workflows

The workflow model supports versioning, step order, approval modes, role/user/hierarchy approvers, escalation configuration and request history. Approval decisions call `canApprove` and block self-approval.

## Separation Of Duties

Rules can warn, require second approval, prohibit or allow a documented exception. Future finance, procurement, project and export modules must reuse these rules.

## Access Review And Diagnostics

Access reviews identify elevated permissions, expired assignments, tenant-wide scopes, confidential access and finance authority. The diagnostic tool returns allowed/denied reasoning without mutating records.

## Extension Rule

Future modules must call the centralized authority and approval services before reading or mutating protected data. No module should invent a separate role-name check.
