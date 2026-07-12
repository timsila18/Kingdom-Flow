import { expect, test } from "@playwright/test";

test("Prompt 12 intelligence command center renders ethical analytics", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/workspace/kings-grace/intelligence", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Leadership Command Center" })).toBeVisible();
  await expect(page.getByText("Ask KingdomFlow anything")).toBeVisible();
  await expect(page.getByText("No single spiritual score")).not.toBeVisible();

  await page.goto("/workspace/kings-grace/intelligence/new-converts", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "New-Convert Assimilation Funnel" })).toBeVisible();
  await expect(page.getByText("No salvation score exists")).toBeVisible();

  await page.goto("/workspace/kings-grace/intelligence/network", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Network & Denomination Oversight" })).toBeVisible();
  await expect(page.getByText("Individuals visible")).toBeVisible();

  await page.goto("/workspace/kings-grace/intelligence/ai", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "AI Executive Copilot" })).toBeVisible();
  await expect(page.getByText("Spiritual judgment made false")).toBeVisible();
});

test("Prompt 13 production readiness and billing surfaces render", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/workspace/kings-grace/production", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Launch & Production Readiness" })).toBeVisible();
  await expect(page.getByText("Secrets in source")).toBeVisible();

  await page.goto("/workspace/kings-grace/production/billing", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Subscription Billing" })).toBeVisible();
  await expect(page.getByText("Charges never silently increase")).toBeVisible();

  await page.goto("/workspace/kings-grace/production/grace", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Humane Grace Periods" })).toBeVisible();
  await expect(page.getByText("Data trapped: false")).toBeVisible();

  await page.goto("/workspace/kings-grace/production/policies", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Policies & Stewardship Commitment" })).toBeVisible();
  await expect(page.getByText("We do not charge for prayer")).toBeVisible();
});
