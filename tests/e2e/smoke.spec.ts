import { expect, test } from "@playwright/test";

test("loads the landing and workspace foundation", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "KingdomFlow" })).toBeVisible();
  await expect(page.getByAltText("KingdomFlow").first()).toBeVisible();
  await page.goto("/auth/sign-in");
  await expect(page.getByText("superadmin@kingdomflow.co.ke")).toBeVisible();
  await page.goto("/auth/test-logins");
  await expect(page.getByRole("heading", { name: "Test logins" })).toBeVisible();
  await expect(page.getByText("Full Platform Tester")).toBeVisible();
  await page.goto("/workspace/kings-grace");
  await expect(page.getByRole("heading", { name: /King's Grace home/ })).toBeVisible();
  await expect(page.getByText("Future ministry widgets")).toBeVisible();
  await expect(page.getByText("Pending role approvals")).toBeVisible();
  await expect(page.getByText("First-time visitors")).toBeVisible();
});
