import { expect, test } from "@playwright/test";

test("people ministry surfaces render core Prompt 3 workflows", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/workspace/kings-grace/people", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Every Person Matters" })).toBeVisible();
  await expect(page.getByText("First-time visitors")).toBeVisible();

  await page.goto("/workspace/kings-grace/people/directory", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "People Directory" })).toBeVisible();
  await expect(page.getByText("Mary Wairimu")).toBeVisible();

  await page.goto("/workspace/kings-grace/people/new-converts", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "New Converts" })).toBeVisible();
  await expect(page.getByText("John Kariuki")).toBeVisible();

  await page.goto("/workspace/kings-grace/people/profile/person-child-grace", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Child protected")).toBeVisible();

  await page.goto("/forms/KGC-IMA-VISITOR", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Imaara First-Time Visitor Form" })).toBeVisible();
  await expect(page.getByText("I consent to be contacted")).toBeVisible();
});
