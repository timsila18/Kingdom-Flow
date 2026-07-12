# Prompt 10: Internal Administration Backbone

Prompt 10 adds KingdomFlow's internal administration backbone for money, people, property, projects and operations.

## Principles

- Giving records originate in Prompt 9. Accounting receives verified entries without changing donor intent or contribution history.
- Restricted funds remain linked to their purpose through fund-aware journals, budgets, projects and payment requests.
- Posted financial records are corrected through reversals or approved adjustments, never silent edits.
- Separation of duties is enforced for posting, reconciliation, payments, supplier approvals, stock counts, leave and payroll.
- Churches configure chart of accounts, budget controls, procurement rules, asset policy, HR policy and payroll settings.
- Finance, HR, payroll, pastoral care and giving remain permission-separated.
- KingdomFlow improves accountability and stewardship without becoming a spiritual authority.

## Implemented Surfaces

- Finance dashboard, chart of accounts, journals, ledger, trial balance and statements.
- Fund accounting, bank/mobile-money accounts, reconciliation and petty cash.
- Budgets, budget controls, payment requests and payment vouchers.
- Supplier onboarding, quotations, purchase orders, goods receipts, supplier invoices and receivables.
- Inventory, stores, stock counts, assets, maintenance and depreciation/disposal foundations.
- Projects, facilities, bookings, utilities, vehicles, transport requests and trip logs.
- HR dashboard, employees, positions, recruitment, contracts, onboarding, leave, attendance, payroll, payslips, performance, training, discipline and staff self-service.

## Database

Migration `20260712122010_internal_administration_backbone.sql` creates accounting, bank, budget, payment, procurement, inventory, asset, project, facility, transport, HR and payroll tables. It also inserts the Prompt 10 permission group and tenant-scoped RLS policies, with stricter policies for supplier bank accounts, employee records, payslips and disciplinary records.

## Workflow Guarantees

- Journals must balance before posting.
- Locked periods block posting without a reopen workflow.
- Verified giving can produce accounting posting previews without mutating contribution records.
- Payment requests check budgets and block creator self-approval.
- Vouchers cannot be marked paid without a real payment reference.
- Quotations are evaluated by criteria, not by cheapest price alone.
- Duplicate supplier invoices are blocked.
- Inventory cannot go negative unless controlled backorders are enabled.
- Facility conflicts are detected.
- Leave can create acting-appointment data for Prompt 2 authority handling.
- Payroll rates are tenant-configurable placeholders, not hard-coded statutory assumptions.
- Employees can view only their own payslips unless payroll-wide access is explicitly granted.

## Reserved For Prompt 11

Prompt 11 should connect member app communication and digital ministry experiences to these administration events through secure notifications, staff self-service messaging and mobile workflows.
