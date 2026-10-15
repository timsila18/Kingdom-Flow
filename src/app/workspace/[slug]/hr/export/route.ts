import { NextResponse } from "next/server";
import { hrAccess, hrData, payrollItems } from "@/lib/hr-store";
import { payeReportFile, payslipReportFile, reportFile, type ReportRow } from "@/lib/hr-reports";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params,
    access = await hrAccess(slug);
  if (!access) return new NextResponse("Access denied", { status: 403 });
  const search = new URL(request.url).searchParams,
    report = search.get("report") ?? "",
    format = search.get("format") ?? "pdf";
  try {
    const data = await hrData(access);
    let title = "",
      headers: string[] = [],
      rows: ReportRow[] = [],
      customFile: Awaited<ReturnType<typeof reportFile>> | null = null;
    if (report === "staff") {
      if (!access.admin)
        return new NextResponse("Access denied", { status: 403 });
      title = "Staff Register";
      headers = [
        "Staff no",
        "Name",
        "Job",
        "Department",
        "Type",
        "Status",
        "Start date",
        "Salary KES",
      ];
      rows = data.staff.map((s) => [
        s.staff_no,
        s.name,
        s.job_title,
        access.workspace.records.find((r) => r.id === s.department_id)?.fields
          .name ?? "",
        s.employment_type,
        s.status,
        s.start_date,
        Number(s.basic_salary),
      ]);
    } else if (report === "performance") {
      if (!access.admin)
        return new NextResponse("Access denied", { status: 403 });
      title = "Performance Reviews";
      headers = [
        "Staff",
        "Review",
        "Cycle",
        "Start",
        "End",
        "Rating",
        "Status",
      ];
      rows = data.reviews.map((r) => [
        data.staff.find((s) => s.id === r.staff_id)?.name ?? "",
        r.title,
        r.cycle_type,
        r.period_start,
        r.period_end,
        r.rating ?? "",
        r.status,
      ]);
    } else if (report === "annual" || report === "p9") {
      if (!access.admin && !access.finance && !access.leader && !data.staff.some((s) => s.user_id === access.user.id))
        return new NextResponse("Access denied", { status: 403 });
      const year = search.get("year") ?? "2026";
      if (!/^20\d{2}$/.test(year)) throw new Error("Choose a valid year.");
      title = `P9 Ready Data ${year}`;
      headers = [
        "Payroll number", "Name", "KRA PIN", "Gross pay", "Taxable pay",
        "PAYE", "Personal relief", "Insurance relief", "Pension", "Mortgage relief",
      ];
      const annual = new Map<string, { name: string; kraPin: string; gross: number; taxable: number; paye: number; relief: number; nssf: number; housing: number }>();
      for (const period of data.periods.filter(
        (p) => p.status === "Paid" && p.month.startsWith(`${year}-`),
      )) {
        const items = await payrollItems(access, period.id);
        for (const { snapshot: s } of items) {
          const previous = annual.get(s.staffNo) ?? { name: s.name, kraPin: s.kraPin, gross: 0, taxable: 0, paye: 0, relief: 0, nssf: 0, housing: 0 };
          previous.gross += s.gross; previous.taxable += s.taxable; previous.paye += s.paye; previous.relief += s.relief; previous.nssf += s.nssf; previous.housing += s.housing;
          annual.set(s.staffNo, previous);
        }
      }
      rows = Array.from(annual, ([staffNo, s]) => [staffNo, s.name, s.kraPin, s.gross, s.taxable, s.paye, s.relief, 0, s.nssf, 0]);
    } else if (["wagebill", "deduction-posting", "earnings-deductions-analysis", "statutory-all", "paye", "shif", "nssf", "housing", "mpesa", "helb"].includes(report)) {
      if (!(access.admin || access.leader || access.finance))
        return new NextResponse("Access denied", { status: 403 });
      const periodId = search.get("period") ?? "", period = data.periods.find((p) => p.id === periodId);
      if (!period) return new NextResponse("Payroll not found", { status: 403 });
      const items = await payrollItems(access, periodId);
      const asMoney = (value: unknown) => Number(Number(value ?? 0).toFixed(2));
      if (report === "wagebill") {
        title = `Wagebill Report ${period.month}`;
        headers = ["Section", "Item", "Amount", "Explanation"];
        const total = (fn: (s: (typeof items)[number]["snapshot"]) => number) => asMoney(items.reduce((sum, item) => sum + fn(item.snapshot), 0));
        rows = [["Summary", "Officers included", items.length, "Employee count in this run"], ["Summary", "Entries processed", items.length, "Payroll rows processed"], ["Earnings", "Total earnings", total((s) => s.gross), "All earnings combined"], ["Earnings", "Regular payments", total((s) => s.gross), "Normal recurring pay"], ["Earnings", "Arrears payments", 0, "Back pay and arrears"], ["Taxable Amount", "Total taxable amount", total((s) => s.taxable), "Taxable earnings base"], ["Deductions", "Total deductions", total((s) => s.deductions + s.nssf + s.sha + s.housing + s.paye), "All deductions combined"], ["Net Pay", "Net pay (would be)", total((s) => s.gross), "Before actual payout constraints"], ["Net Pay", "Net pay (actual)", total((s) => s.net), "Actual payroll payout"], ["Employer Obligations", "NSSF dues", total((s) => s.employerNssf), "Employer NSSF cost"], ["Employer Obligations", "NITA", 0, "Training levy"], ["Employer Obligations", "Housing levy", total((s) => s.employerHousing), "Employer housing levy"], ["Final Wagebill", "Final wagebill", total((s) => s.gross + s.employerNssf + s.employerHousing), "Earnings + employer obligations"]];
      } else if (report === "deduction-posting") {
        title = `Monthly Deduction Posting List ${period.month}`;
        headers = ["Posting group", "Frequency", "Description", "Deduction amount", "Commission", "Cheque amount"];
        const groups = new Map<string, number>();
        for (const { snapshot: s } of items) { const deductions: [string, number][] = [["PAYE", s.paye], ["NSSF", s.nssf], ["SHIF", s.sha], ["Housing levy", s.housing], ...s.inputs.filter((i) => i.kind === "Deduction").map((i) => [i.description, Number(i.amount)] as [string, number])]; for (const [name, value] of deductions) groups.set(name, (groups.get(name) ?? 0) + value); }
        rows = Array.from(groups, ([name, value]) => [name, "Monthly", name, asMoney(value), 0, asMoney(value)]);
      } else if (report === "earnings-deductions-analysis") {
        title = `Earnings and Deductions Analysis ${period.month}`;
        headers = ["Staff no", "Name", "Department", "Gross pay", "Earnings", "PAYE", "NSSF", "SHIF", "Housing levy", "Other deductions", "Net pay"];
        rows = items.map(({ snapshot: s }) => [s.staffNo, s.name, s.departmentName ?? "Unassigned", s.gross, s.earnings, s.paye, s.nssf, s.sha, s.housing, s.deductions, s.net]);
      } else if (report === "statutory-all") {
        title = `All Statutory Deductions ${period.month}`;
        headers = ["Serial number", "Payroll number", "Full name", "Gross pay", "ID number", "KRA PIN", "PAYE payable", "Housing levy payable", "NSSF no", "NSSF payable", "SHIF no", "SHIF payable", "Phone no"];
        rows = items.map(({ snapshot: s }, index) => [index + 1, s.staffNo, s.name, s.gross, "", s.kraPin, s.paye, s.housing, s.nssfNo, s.nssf, s.shaNo, s.sha, ""]);
      } else if (report === "paye") {
        title = `PAYE ${period.month}`;
        headers = [
          "TAX PIN", "NAMES", "RESIDENT STATUS", "TYPE OF EMPLOYEE", "PWD", "", "GROSS PAY",
          "CAR BENEFIT", "MEALS", "NON CASH BENEFITS", "TYPE OF HOUSE GIVEN", "", "OTHER BENEFITS",
          "", "SHIF", "NSSF", "OTHER PENSION", "POST RETIREMENT MEDICAL", "MORTGAGE INTEREST",
          "AHL", "", "MONTHLY PERSONAL RELIEF", "INSURANCE RELIEF", "", "SELF ASSESMENT PAYE",
        ];
        rows = items.map(({ snapshot: s }) => [
          s.kraPin, s.name.toUpperCase(), "Resident", "Primary Employee", "No", "", s.gross,
          0, 0, 0, "", "", 0, "", s.sha, s.nssf, 0, 0, 0, s.housing, "", s.relief, 0, "", s.paye,
        ]);
        if (format === "xlsx") customFile = await payeReportFile(rows);
      } else if (report === "shif") {
        title = `SHIF ${period.month}`;
        headers = ["Payroll number", "First name", "Last name", "Identity type", "ID no", "KRA PIN", "SHIF no", "Contribution amount", "Phone"];
        rows = items.map(({ snapshot: s }) => [s.staffNo, s.name.split(" ")[0], s.name.split(" ").slice(1).join(" "), "National ID", "", s.kraPin, s.shaNo, s.sha, ""]);
      } else if (report === "nssf") {
        title = `NSSF ${period.month}`;
        headers = ["Payroll number", "Surname", "Other names", "ID no", "KRA PIN", "NSSF no", "Gross pay", "Voluntary"];
        rows = items.map(({ snapshot: s }) => [s.staffNo, s.name.split(" ").slice(-1)[0], s.name.split(" ").slice(0, -1).join(" "), "", s.kraPin, s.nssfNo, s.gross, "No"]);
      } else if (report === "housing") {
        title = `Housing Levy ${period.month}`;
        headers = ["Payroll number", "Name", "ID no", "KRA PIN", "Gross pay", "Employee AHL", "Employer AHL"];
        rows = items.map(({ snapshot: s }) => [s.staffNo, s.name, "", s.kraPin, s.gross, s.housing, s.employerHousing]);
      } else if (report === "mpesa") {
        title = `Net to MPESA ${period.month}`;
        headers = ["SNO", "Staff number", "Employee name", "Department", "Phone", "Payment method", "Account number", "Total month pay", "Gross would be", "Net would be", "Actual gross", "Actual payable amount", "Reduction reason"];
        rows = items.map(({ snapshot: s }, index) => [index + 1, s.staffNo, s.name, s.departmentName ?? "Unassigned", "", "MPESA", s.account, s.basic, s.gross, s.net, s.gross, s.net, ""]);
      } else {
        title = `HELB ${period.month}`;
        headers = ["ID number", "Names", "Staff number", "Amount"];
        rows = [];
      }
    } else {
      const periodId = search.get("period") ?? "",
        period = data.periods.find((p) => p.id === periodId);
      if (!period)
        return new NextResponse("Payroll not found", { status: 403 });
      const items = await payrollItems(access, periodId);
      if (report === "payslip") {
        if (period.status === "Draft")
          throw new Error("Draft payroll is not an issued payslip.");
        const pay = items.find(
          (i) => i.staff_id === search.get("staff"),
        )?.snapshot;
        if (!pay) return new NextResponse("Access denied", { status: 403 });
        title = `${period.status === "Paid" ? "Payslip" : "Provisional Payslip"} ${period.month}`;
        headers = ["Item", "Value"];
        rows = [
          ["Staff", `${pay.staffNo} - ${pay.name}`],
          ["Period", period.month],
          ["Currency", "KES"],
          ["Paid days", pay.days],
          ["Basic", pay.basic],
          ["Other earnings", pay.earnings],
          ["Gross", pay.gross],
          ["NSSF", pay.nssf],
          ["SHA", pay.sha],
          ["Housing levy", pay.housing],
          ["Taxable income", pay.taxable],
          ["Personal relief", pay.relief],
          ["PAYE", pay.paye],
          ...pay.inputs
            .filter((i) => i.kind === "Deduction")
            .map((i) => [i.description, Number(i.amount)] as ReportRow),
          ["Net pay", pay.net],
          ["Payment reference", period.payment_reference ?? "Not yet paid"],
        ];
        if (format === "pdf") customFile = await payslipReportFile(access.tenant.publicName, period.month, pay);
      } else {
        if (!(access.admin || access.leader || access.finance))
          return new NextResponse("Access denied", { status: 403 });
        if (report === "register") {
          title = `Payroll Register ${period.month}`;
          headers = [
            "No",
            "Name",
            "Gross",
            "NSSF",
            "SHA",
            "AHL",
            "PAYE",
            "Other",
            "Net",
          ];
          rows = items.map(({ snapshot: s }) => [
            s.staffNo,
            s.name,
            s.gross,
            s.nssf,
            s.sha,
            s.housing,
            s.paye,
            s.deductions,
            s.net,
          ]);
        } else if (report === "statutory") {
          title = `Statutory Summary ${period.month}`;
          headers = [
            "Name",
            "KRA PIN",
            "NSSF No",
            "SHA No",
            "PAYE",
            "NSSF employee",
            "NSSF employer",
            "SHA",
            "AHL combined",
          ];
          rows = items.map(({ snapshot: s }) => [
            s.name,
            s.kraPin,
            s.nssfNo,
            s.shaNo,
            s.paye,
            s.nssf,
            s.employerNssf,
            s.sha,
            s.housing + s.employerHousing,
          ]);
        } else if (report === "department") {
          title = `Payroll by Department ${period.month}`;
          headers = [
            "Department",
            "Staff",
            "Gross KES",
            "Net KES",
            "Employer cost KES",
          ];
          const totals = new Map<
            string,
            { count: number; gross: number; net: number; cost: number }
          >();
          for (const { snapshot: s } of items) {
            const name = s.departmentName ?? "Unassigned";
            const total = totals.get(name) ?? {
              count: 0,
              gross: 0,
              net: 0,
              cost: 0,
            };
            total.count++;
            total.gross += s.gross;
            total.net += s.net;
            total.cost += s.gross + s.employerNssf + s.employerHousing;
            totals.set(name, total);
          }
          rows = Array.from(totals, ([name, total]) => [
            name,
            total.count,
            Number(total.gross.toFixed(2)),
            Number(total.net.toFixed(2)),
            Number(total.cost.toFixed(2)),
          ]);
        } else if (report === "bank") {
          if (!access.admin && !access.finance)
            return new NextResponse("Access denied", { status: 403 });
          title = `Net to Bank ${period.month}`;
          headers = [
            "Staff No",
            "Name",
            "Bank",
            "Account",
            "Net KES",
            "Status",
          ];
          rows = items.map(({ snapshot: s }) => [
            s.staffNo,
            s.name,
            s.bank,
            s.account,
            s.net,
            period.status,
          ]);
        } else throw new Error("Report not found.");
      }
    }
    const file = customFile ?? await reportFile(title, access.tenant.publicName, headers, rows, format);
    const { error } = await getSupabaseAdmin()
      .from("kf_hr_audit")
      .insert({
        tenant_id: access.tenant.id,
        actor_id: access.user.id,
        action: `export.${report}`,
        detail: { format },
      });
    if (error) throw new Error("Export audit could not be saved.");
    return new NextResponse(new Uint8Array(file.bytes), {
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="kingdomflow-${report}.${file.extension}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return new NextResponse(
      error instanceof Error ? error.message : "Report could not be generated",
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}
