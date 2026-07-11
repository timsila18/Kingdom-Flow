import { expect, test } from "@playwright/test";

test("authority workspace renders core Prompt 2 surfaces", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/workspace/kings-grace/authority", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Governance & Authority" })).toBeVisible();
  await page.goto("/workspace/kings-grace/authority/role-builder", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Role Builder" })).toBeVisible();
  await expect(page.getByText("Separation of duties warning")).toBeVisible();
  await page.goto("/workspace/kings-grace/authority/effective-access", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Effective Access Viewer" })).toBeVisible();
  await page.goto("/workspace/kings-grace/authority/diagnostic", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Authorization Diagnostic Tool" })).toBeVisible();
});
