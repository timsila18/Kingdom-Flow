import { expect, test } from "@playwright/test";

test("services Prompt 7 surfaces render core ministry workflows", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/workspace/kings-grace/services", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Services & Volunteers" })).toBeVisible();
  await expect(page.getByText("Roster gaps")).toBeVisible();

  await page.goto("/workspace/kings-grace/services/order", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Order of Service" })).toBeVisible();
  await expect(page.getByText("Structured service-plan items")).toBeVisible();

  await page.goto("/workspace/kings-grace/services/rosters", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Rosters" })).toBeVisible();
  await expect(page.getByText("Assisted roster suggestions")).toBeVisible();

  await page.goto("/workspace/kings-grace/services/replacements", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Replacement Workflow" })).toBeVisible();
  await expect(page.getByText("Original assignment history is preserved")).toBeVisible();

  await page.goto("/workspace/kings-grace/services/incidents", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Incidents" })).toBeVisible();
  await expect(page.getByText("Restricted details hidden")).toBeVisible();
});
