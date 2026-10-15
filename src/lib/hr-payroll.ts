export type PayInput = { kind: string; description: string; amount: number };
export type PayStaff = {
  departmentName?: string;
  id: string;
  staff_no: string;
  name: string;
  basic_salary: number;
  start_date: string;
  end_date: string | null;
  details: {
    resident?: boolean;
    bank?: string;
    account?: string;
    kraPin?: string;
    nssfNo?: string;
    shaNo?: string;
    nationalId?: string;
  };
};
export function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
export function progressiveTax(taxable: number) {
  let remaining = Math.max(0, taxable),
    tax = 0;
  for (const [limit, rate] of [
    [24000, 0.1],
    [8333, 0.25],
    [467667, 0.3],
    [300000, 0.325],
    [Infinity, 0.35],
  ]) {
    const part = Math.min(remaining, limit);
    tax += part * rate;
    remaining -= part;
    if (remaining <= 0) break;
  }
  return money(tax);
}
export function calculatePay(
  staff: PayStaff,
  month: string,
  inputs: PayInput[],
) {
  if (!/^2026-(0[2-9]|1[0-2])$/.test(month))
    throw new Error(
      "Verified payroll rates currently cover February to December 2026 only.",
    );
  const first = new Date(`${month}-01T00:00:00Z`);
  const last = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  );
  const start = Math.max(first.getTime(), new Date(staff.start_date).getTime());
  const end = Math.min(
    last.getTime(),
    staff.end_date ? new Date(staff.end_date).getTime() : last.getTime(),
  );
  const days = Math.max(0, Math.floor((end - start) / 86400000) + 1);
  const basic = money((Number(staff.basic_salary) * days) / last.getUTCDate());
  const earnings = money(
    inputs
      .filter((i) => i.kind === "Earning")
      .reduce((s, i) => s + Number(i.amount), 0),
  );
  const deductions = money(
    inputs
      .filter((i) => i.kind === "Deduction")
      .reduce((s, i) => s + Number(i.amount), 0),
  );
  if ([basic, earnings, deductions].some((v) => !Number.isFinite(v) || v < 0))
    throw new Error("Invalid payroll amounts.");
  const gross = money(basic + earnings);
  const nssf = money(Math.min(gross * 0.06, 6480));
  const sha = gross ? money(Math.max(300, gross * 0.0275)) : 0;
  const housing = money(gross * 0.015);
  const taxable = money(Math.max(0, gross - nssf - sha - housing));
  const relief = staff.details.resident === false ? 0 : 2400;
  const paye = money(Math.max(0, progressiveTax(taxable) - relief));
  const net = money(gross - nssf - sha - housing - paye - deductions);
  if (net < 0) throw new Error(`${staff.name}: deductions exceed pay.`);
  return {
    departmentName: staff.departmentName ?? "Unassigned",
    staffId: staff.id,
    staffNo: staff.staff_no,
    name: staff.name,
    month,
    days,
    basic,
    earnings,
    gross,
    nssf,
    sha,
    housing,
    taxable,
    relief,
    paye,
    deductions,
    net,
    employerNssf: nssf,
    employerHousing: housing,
    bank: staff.details.bank ?? "",
    account: staff.details.account ?? "",
    kraPin: staff.details.kraPin ?? "",
    nssfNo: staff.details.nssfNo ?? "",
    shaNo: staff.details.shaNo ?? "",
    nationalId: staff.details.nationalId ?? "",
    inputs,
    rulesVersion: "KE-2026-year4-v1",
  };
}
export type PaySnapshot = ReturnType<typeof calculatePay>;
