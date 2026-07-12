import { expect, test } from "@playwright/test";

test("small groups Prompt 5 surfaces render core workflows", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/workspace/kings-grace/groups", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Cells & Fellowships" })).toBeVisible();
  await expect(page.getByText("Active groups")).toBeVisible();

  await page.goto("/workspace/kings-grace/groups/leader", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Group Leader Workspace" })).toBeVisible();
  await expect(page.getByText("Start attendance")).toBeVisible();

  await page.goto("/workspace/kings-grace/groups/directory", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Group Directory" })).toBeVisible();
  await expect(page.getByText("Private residential addresses are never shown here.")).toBeVisible();

  await page.goto("/workspace/kings-grace/groups/giving", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Meeting Giving Totals" })).toBeVisible();
  await expect(page.getByText("Totals only")).toBeVisible();

  await page.goto("/workspace/kings-grace/groups/multiplication", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Multiplication" })).toBeVisible();
  await expect(page.getByText("never automatically splits")).toBeVisible();
});
