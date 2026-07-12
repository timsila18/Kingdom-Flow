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
  await page.getByRole("link", { name: "Sign in and open area" }).first().click();
  await expect(page).toHaveURL(/\/platform/);
  await page.goto("/workspace/kings-grace");
  await expect(page.getByRole("heading", { name: /King's Grace home/ })).toBeVisible();
  await expect(page.getByText("KingdomFlow Super Admin")).toBeVisible();
  await page.getByRole("link", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await page.goto("/workspace/kings-grace");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await page.goto("/auth/demo-login?email=superadmin%40kingdomflow.co.ke");
  await page.goto("/workspace/kings-grace");
  await expect(page.getByText("Future ministry widgets")).toBeVisible();
  await expect(page.getByText("Pending role approvals")).toBeVisible();
  await expect(page.getByText("First-time visitors")).toBeVisible();
});
