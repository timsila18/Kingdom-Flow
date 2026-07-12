import { expect, test } from "@playwright/test";

test("events Prompt 8 surfaces render core ministry workflows", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/workspace/kings-grace/events", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Events & Missions" })).toBeVisible();
  await expect(page.getByText("Safeguarding gaps")).toBeVisible();

  await page.goto("/workspace/kings-grace/events/registrations", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Event Registrations" })).toBeVisible();
  await expect(page.getByText("total KES")).toBeVisible();

  await page.goto("/workspace/kings-grace/events/check-in", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Event Check-In" })).toBeVisible();
  await expect(page.getByText("minimum participant data")).toBeVisible();

  await page.goto("/workspace/kings-grace/events/child-pickup", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Child Pickup" })).toBeVisible();
  await expect(page.getByText("pickup code protected")).toBeVisible();

  await page.goto("/workspace/kings-grace/events/outreach", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Outreach" })).toBeVisible();
  await expect(page.getByText("consent-based contact capture")).toBeVisible();

  await page.goto("/workspace/kings-grace/events/missions", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Mission Trips" })).toBeVisible();
  await expect(page.getByText("documents restricted")).toBeVisible();
});
