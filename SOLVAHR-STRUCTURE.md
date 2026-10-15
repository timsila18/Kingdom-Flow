# SolvaHR Structure Review

Read-only review of https://solvahr.co.ke using the authorised General Manager account. No staff/payroll records were created or changed, no payroll processing was performed, and no employee reports were downloaded. Credentials and staff data are not included here.

## Observed Navigation

The application presents Solva HR within Solva ERP Suite. Relevant workspaces are Staff Register, Performance, Payroll and Reports. Leave & Attendance and Training are separate HR workspaces.

## Staff Register

Primary views: Directory, Staff File, User Accounts and Lifecycle.

Sections observed:
- Staff Profiles, Departments, Branches, Designations and Job Grades.
- Employment History, Dependants, Emergency Contacts and Documents.
- Disciplinary Records, Promotions, Transfers and Confirmations.
- Contract Renewals, Offboarding, Exit Interviews and Clearance Management.

Available controls include Add Employee and Create User Accounts. Opening the Add Employee control did not expose a creation form in the reviewed session; complete field definitions are not verified.

## Performance

Sections observed: KPIs, Goals, Appraisals, Performance Reviews, Performance Improvement Plans, Promotion Cases, Succession Planning, Talent Matrix, Performance Reports and Performance Settings.

The simple appraisal-cycle form exposes Cycle title, Cycle type, Period start and Period end. Cycle types include quarterly, annual, mid-year, probation and custom reviews. No cycle was launched.

## Payroll

Sections observed:
- Payroll Dashboard, Payroll Periods and Employee Payroll Data.
- Earnings, Deductions and Variable Inputs.
- Process Payroll and Review & Approval.
- Payslips, P9 Forms, Net to Bank and Statutory Reports.
- Loan & Checkoff Management and Casual Payroll.
- Payroll Reports, Payroll Validation Warnings, Payroll Audit Trail and Payroll Settings.

The dashboard includes period/package overview, variance review, data warnings, day-based deductions, recurring loan/SACCO/welfare deductions, approval chain, close checklist, salary additions, export center, recent runs and export history.

Visible addition types include Bonus, Incentive, Commission, Allowance and Adjustment. Day deductions have dates, days, basis, category, reason and comments. No financial action was taken. Visible controls alone do not establish backend correctness or calculation rules.

## Reports

Common selectors: year, month, report family and format. Formats: PDF, Excel and CSV.

HR report headings: Employee master list, Exited employees, Headcount by department and All staff data schedule. Observed staff schedule columns: Staff No., Name, Gender, DOB, Age, Phone, Branch, Department, Designation, Salary and Status.

Payroll report headings: Payroll register, Statutory summary and Payroll by department.

Performance report headings: Performance reviews and Performance distribution, covering appraisal completion, promotions and improvement-plan exposure.

Additional report navigation includes branch/department reports, saved/scheduled reports, custom builder, export history and report-access logs. These additional sections were not individually validated.

## KingdomFlow Adaptation

Keep one Church Admin HR menu with Staff, Performance and Payroll tabs. Put the corresponding reports inside each tab and retain a common report selector. Keep advanced lifecycle and payroll controls inside their relevant workspace rather than adding many primary sidebar entries.

Use church departments and branches, with separate employee, stipend-supported worker and volunteer classifications. Existing church membership or ministry roles must not automatically create employment or payroll eligibility.

Use dedicated tenant-isolated HR tables, restricted documents and explicit HR/payroll permissions. Church Admin prepares records and payroll; an authorised Church Leader approves; Finance Officer records payment. Staff access is self-only and must not require an eighth user type.

## Outstanding Verification

Anonymised exported PDF/Excel samples are needed to match printed layouts, branding, page breaks, totals and sign-off blocks. Staff-form fields, appraisal scoring, payroll formulas, approval transitions and export behaviour need validation before claiming exact functional parity. Kenya-specific payroll rules must be checked against current authoritative requirements rather than inferred from the UI.
