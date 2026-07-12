import { expect, test } from "@playwright/test";

test("administration Prompt 10 surfaces render core operations workflows", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/workspace/kings-grace/administration", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Finance & Operations" })).toBeVisible();
  await expect(page.getByText("Contributions awaiting posting")).toBeVisible();

  await page.goto("/workspace/kings-grace/administration/accounts", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Chart of Accounts" })).toBeVisible();
  await expect(page.getByText("Main Bank Account")).toBeVisible();

  await page.goto("/workspace/kings-grace/administration/reconciliation", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Bank Reconciliation" })).toBeVisible();
  await expect(page.getByText("unmatched KES")).toBeVisible();

  await page.goto("/workspace/kings-grace/administration/payment-vouchers", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Payment Vouchers" })).toBeVisible();
  await expect(page.getByText("PV-2026-0001")).toBeVisible();

  await page.goto("/workspace/kings-grace/administration/supplier-invoices", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Supplier Invoices & Payables" })).toBeVisible();
  await expect(page.getByText("ST-778")).toBeVisible();

  await page.goto("/workspace/kings-grace/administration/inventory", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  await expect(page.getByText("Camera Kit")).toBeVisible();

  await page.goto("/workspace/kings-grace/administration/bookings", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Facility Bookings" })).toBeVisible();
  await expect(page.getByText("Sunday Service")).toBeVisible();

  await page.goto("/workspace/kings-grace/administration/payroll", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Payroll" })).toBeVisible();
  await expect(page.getByText("rates configurable")).toBeVisible();
});
