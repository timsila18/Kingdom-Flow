import { expect, test } from "@playwright/test";

test("loads the landing and workspace foundation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "KingdomFlow" })).toBeVisible();
  await page.goto("/workspace/kings-grace");
  await expect(page.getByRole("heading", { name: /King's Grace home/ })).toBeVisible();
  await expect(page.getByText("Future ministry widgets")).toBeVisible();
});
