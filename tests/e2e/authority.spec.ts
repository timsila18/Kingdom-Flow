import { expect, test } from "@playwright/test";

test("authority workspace renders core Prompt 2 surfaces", async ({ page }) => {
  await page.goto("/workspace/kings-grace/authority");
  await expect(page.getByRole("heading", { name: "Governance & Authority" })).toBeVisible();
  await page.goto("/workspace/kings-grace/authority/role-builder");
  await expect(page.getByRole("heading", { name: "Role Builder" })).toBeVisible();
  await expect(page.getByText("Separation of duties warning")).toBeVisible();
  await page.goto("/workspace/kings-grace/authority/effective-access");
  await expect(page.getByRole("heading", { name: "Effective Access Viewer" })).toBeVisible();
  await page.goto("/workspace/kings-grace/authority/diagnostic");
  await expect(page.getByRole("heading", { name: "Authorization Diagnostic Tool" })).toBeVisible();
});
