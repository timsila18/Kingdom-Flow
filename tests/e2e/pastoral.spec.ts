import { expect, test } from "@playwright/test";

test("pastoral care module renders Prompt 4 workflows", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/workspace/kings-grace/pastoral-care", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Pastoral Care" })).toBeVisible();
  await expect(page.getByText("Confidentiality by default")).toBeVisible();

  await page.goto("/workspace/kings-grace/pastoral-care/cases", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Pastoral Cases" })).toBeVisible();
  await expect(page.getByText("New believer counselling referral")).toBeVisible();

  await page.goto("/workspace/kings-grace/pastoral-care/cases/case-counselling-john", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "New believer counselling referral" })).toBeVisible();
  await expect(page.getByText("Visible Notes")).toBeVisible();

  await page.goto("/workspace/kings-grace/pastoral-care/prayer", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Prayer Requests" })).toBeVisible();
  await expect(page.getByText("Private prayer request")).toBeVisible();

  await page.goto("/workspace/kings-grace/pastoral-care/welfare", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Welfare Requests" })).toBeVisible();
  await expect(page.getByText("rent support")).toBeVisible();

  await page.goto("/workspace/kings-grace/pastoral-care/safeguarding", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Safeguarding" })).toBeVisible();
  await expect(page.getByText("If someone is in immediate danger")).toBeVisible();
});
