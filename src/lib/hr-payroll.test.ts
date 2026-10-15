import { describe, expect, it } from "vitest";
import { calculatePay, progressiveTax } from "./hr-payroll";
const staff = {
  id: "1",
  staff_no: "KF001",
  name: "Worker",
  basic_salary: 50000,
  start_date: "2026-01-01",
  end_date: null,
  details: {},
};
describe("Kenyan payroll snapshots", () => {
  it("applies progressive bands", () => {
    expect(progressiveTax(24000)).toBe(2400);
    expect(progressiveTax(32333)).toBe(4483.25);
  });
  it("calculates standard monthly statutory deductions", () => {
    const p = calculatePay(staff, "2026-09", []);
    expect(p.nssf).toBe(3000);
    expect(p.sha).toBe(1375);
    expect(p.housing).toBe(750);
    expect(p.taxable).toBe(44875);
    expect(p.net).toBe(39029.15);
  });
  it("caps year-four NSSF", () => {
    expect(
      calculatePay({ ...staff, basic_salary: 200000 }, "2026-09", []).nssf,
    ).toBe(6480);
  });
  it("prorates joining and exit dates", () => {
    expect(
      calculatePay(
        { ...staff, start_date: "2026-09-16", basic_salary: 30000 },
        "2026-09",
        [],
      ).basic,
    ).toBe(15000);
  });
  it("rejects negative net pay", () => {
    expect(() =>
      calculatePay(staff, "2026-09", [
        { kind: "Deduction", description: "Loan", amount: 60000 },
      ]),
    ).toThrow();
  });
  it("does not apply rates to unverified periods", () => {
    expect(() => calculatePay(staff, "2025-01", [])).toThrow();
  });
  it("does not grant nonresidents personal relief", () => {
    expect(
      calculatePay({ ...staff, details: { resident: false } }, "2026-09", [])
        .relief,
    ).toBe(0);
  });
});
