# SolvaHR And ESS Parity Requirements

Requested target: Church HR should look and behave like SolvaHR, including employee self-service and exported documents. The current three-tab HR foundation is not full SolvaHR parity.

## Reference Status

The authorised GM workspace was inspected again on 18 September 2026. It exposes manager HR, payroll, leave/attendance, performance and reports. No employee ESS workspace was exposed through its visible navigation or workspace search. No staff records, leave requests or payroll records were changed. The session was signed out after inspection.

Required references before claiming an exact match:

- Additional employee-view evidence where forms and states were not covered by the read-only ESS review below.
- Redacted payslip, P9, wagebill/payroll register and staff report PDFs, including multi-page examples.
- Corresponding Excel exports where workbook formatting must also match.
- The relevant SolvaHR source repository, if exact calculation and workflow parity is required beyond observable UI behaviour.

No employee credentials or personnel data belong in this document or the repository.

### Employee ESS Review

An authorised employee session was inspected read-only on 18 September 2026 and signed out afterward. No requests were submitted and no employee records were edited. Navigation and form observations are recorded in `SOLVAHR-ESS-STRUCTURE.md`. This confirms the reference structure, not end-to-end approval behaviour or exported PDF geometry.

## ESS Implementation Contract

ESS is an employment capability attached to a staff record, not an eighth church user type. The church member, staff member and login remain linked identities. A church leader, finance officer, coordinator or care worker who is also employed must have the same self-service access as other staff.

The following remains the implementation scope. Refer to the ESS structure document for which screens and fields were directly inspected; the remaining workflow behaviour still requires verification:

- My profile and employment information; bank/contact change requests with approval and audit history.
- My leave: balances, applications, status, cancellations and attachments.
- My attendance, timesheets and overtime requests, subject to the reference workflow.
- My performance: goals, self-appraisal, feedback and final results.
- My pay: issued payslips, annual P9 documents and authorised loan/checkoff information.
- My documents, training, announcements and request history, where present in the reference.

All self-service queries and file downloads must enforce both tenant and linked staff identity. Staff must not receive another person's salary, reviews, personnel files or requests. Private HR administrative documents are not automatically published into ESS; employee-visible documents require an explicit visibility classification.

Approval rules must be implemented transactionally. A self-service request must not directly edit salary, bank instructions, accrued leave or approved payroll. Approved leave must distinguish paid and unpaid leave; paid leave must not exclude a person's entire monthly salary. Payroll deductions must originate from approved inputs and be preserved in the period snapshot.

Employment exit must not automatically remove church membership. Historical document access and ESS revocation must be explicit policies, verified against the reference and tested.

## Document Parity Contract

The user requested actual SolvaHR layouts rather than approximate blue-branded tables. Compare page size/orientation, margins, typography, employer and employee identity blocks, column order, earnings/deductions grouping, totals, declarations, signature blocks, footers and page breaks against the redacted samples.

Use KingdomFlow/church branding and real church/staff data while preserving the requested template geometry and report structure. P9 must be its own annual tax document, not the existing annual-summary table renamed. Wagebill reports must include the requested employer-cost, department and approval structure as confirmed by the reference.

Layout similarity alone is not calculation parity. Validate representative normal salary, paid/unpaid leave, additions, recurring deductions, loan/checkoff, joining/exit, relief and annual-tax cases before claiming behavioural equivalence. Legal changes must take precedence over reproducing an outdated calculation.

## Release Gates

1. Review and record the ESS/reference-template evidence without retaining real employee data.
2. Implement missing staff lifecycle, ESS requests, approvals, payroll scenarios and report templates.
3. Verify employee-to-supervisor-to-administrator-to-payroll workflows, including cancellations, concurrent updates and access denials.
4. Render PDFs and compare redacted reference layouts across one-page and multi-page outputs.
5. Verify on the deployed site and remove all temporary verification data.

No exact-parity completion claim is justified until these gates pass.
