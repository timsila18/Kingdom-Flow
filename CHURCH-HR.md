# Church HR

## The Everyday Process

1. Church Admin opens People and adds the person, or finds the person who joined the church.
2. Open Church HR > Staff > Confirm church membership. Confirmation is an explicit administrative decision; joining online alone is not confirmation.
3. For staff self-service, link the person's existing account through Settings > Team and its church-person field. HR does not create a separate login.
4. Choose Add staff. Select a confirmed member, enter staff number, job, department, supervisor, dates and salary. Volunteers cannot be included in payroll. Save the staff record again if its account link changes later.
5. Performance: the administrator creates a review with work goals and dates. Staff submit their own comments. Their assigned Church Leader reviews and rates job performance. The administrator finalises it.
6. Payroll: the administrator starts a month, adds taxable earnings or after-tax deductions, calculates and checks the register, then submits.
7. A different Church Leader approves or returns the submitted payroll. Switching the preparer's account to another role does not bypass independent approval.
8. Finance Officer completes payment outside KingdomFlow, then records its reference. KingdomFlow does not initiate bank transfers.
9. Staff use their existing account to download their own paid payslip. Administrators and finance download authorised reports.

## Data And Security

- Dedicated HR tables; no salary or performance records in the general workspace document.
- Confirmed membership is checked in the backend and enforced on staff insertion by a database trigger.
- Anonymous and ordinary authenticated database clients cannot directly access HR tables or payroll RPCs. Each server request checks current church membership and active responsibility.
- Leaders see assigned staff reviews, not every person's performance file. Finance does not receive other staff performance reviews.
- Staff see only their own reviews and paid payroll snapshots. Approved payroll cannot be recalculated or have its inputs changed.
- Input and staff edits invalidate draft calculations. Membership/workspace changes require recalculation before submission.
- Staff documents are private, restricted to Church Admin, limited to PDF/PNG/JPEG and 5 MB. Download links expire after 60 seconds.
- HR actions and exports have an audit trail. Staff lifecycle notes are recorded separately; job/status/salary changes are made through Edit staff.
- Exports: PDF, Excel and CSV; payroll department totals use snapshot department names. CSV strings are protected against formula injection.

## Payroll Scope

The implemented calculation is a **standard Kenyan monthly cash-salary calculation in KES, February through December 2026**. Joining and exit dates are prorated by calendar days. Active payroll-eligible staff are included; volunteers, suspended and exited staff are not automatically included. On-leave staff require administrative review before payroll eligibility/status changes.

Sources checked 18 September 2026:

- [KRA PAYE](https://www.kra.go.ke/individual/filing-paying/types-of-taxes/paye): progressive monthly bands, resident personal relief, deductible NSSF/SHA/housing contributions, employee and employer housing levy.
- [NSSF year-four notice](https://www.nssf.or.ke/notice-to-employers-year-4-2026-nssf-contribution-rates/notice): 6% employee and employer contributions, capped at KES 6,480 each from February 2026.
- [Social Health Insurance regulations](https://health.go.ke/sites/default/files/2024-11/Social%20Health%20Insurance%20%28General%29%20Regulations%2C%202024_0.pdf): salaried SHA contribution 2.75%, minimum KES 300.

Taxable variable earnings and after-tax deductions are supported. Benefits in kind, additional pension schemes, mortgage deductions, insurance relief, tax-exemption certificates, Tier II contracting-out, arrears, casual/day-rate payroll, automatic loan-balance amortisation and other countries are **not yet implemented**. Do not process affected staff as though these scenarios were supported. A qualified payroll professional must review actual staff tax circumstances and the calculated payroll before approval.

Statutory exports are supporting summaries, not certified authority-upload files. Annual summaries do not replace the official KRA P9/iTax templates. Payments and statutory remittances remain external.

## SolvaHR Parity

The three primary modules and report styling follow the inspected SolvaHR structure. Exact SolvaHR calculation and exported-layout parity has not been verified. The broader ERP features described in SOLVAHR-STRUCTURE.md, including succession planning, talent matrices and advanced payroll scenarios, are not claimed as implemented.

## Verification

Run scripts/verify-simple-workflows.mjs with ADMIN_EMAIL and ADMIN_PASSWORD provided through the environment. It creates a temporary church and users, checks shared persistence, member eligibility, review transitions, payroll approval/payment separation, report formats and access denials, then deletes the temporary data. No permanent demo accounts are created.
