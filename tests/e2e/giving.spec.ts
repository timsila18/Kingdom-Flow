import { expect, test } from "@playwright/test";

test("giving Prompt 9 surfaces render core stewardship workflows", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/workspace/kings-grace/giving", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Giving & Stewardship" })).toBeVisible();
  await expect(page.getByText("Restricted inflows")).toBeVisible();

  await page.goto("/workspace/kings-grace/giving/destinations", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Payment Destinations" })).toBeVisible();
  await expect(page.getByText("Building Project Paybill")).toBeVisible();

  await page.goto("/workspace/kings-grace/giving/cash-count", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Cash Count" })).toBeVisible();
  await expect(page.getByText("discrepancy")).toBeVisible();

  await page.goto("/workspace/kings-grace/giving/receipts", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Receipts" })).toBeVisible();
  await expect(page.getByText("KGC-IMA-2026-000001")).toBeVisible();

  await page.goto("/workspace/kings-grace/giving/member", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Member Giving Portal" })).toBeVisible();
  await expect(page.getByText("No comparisons")).toBeVisible();

  await page.goto("/workspace/kings-grace/giving/reconciliation", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Reconciliation" })).toBeVisible();
  await expect(page.getByText("No journals yet")).toBeVisible();
});
