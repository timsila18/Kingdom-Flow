import { expect, test } from "@playwright/test";

test("Prompt 11 member and digital ministry surfaces render safely", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/workspace/kings-grace/member", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Member Home" })).toBeVisible();
  await expect(page.getByText("No secret stream keys")).toBeVisible();

  await page.goto("/workspace/kings-grace/member/journey", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "My Journey" })).toBeVisible();
  await expect(page.getByText("Sensitive counselling")).toBeVisible();

  await page.goto("/workspace/kings-grace/member/sermons", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Sermons" })).toBeVisible();
  await expect(page.getByText("Serving with Grace").first()).toBeVisible();

  await page.goto("/workspace/kings-grace/member/live", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Live" })).toBeVisible();
  await expect(page.getByText("secret key exposed false")).toBeVisible();

  await page.goto("/workspace/kings-grace/member/messages", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Messages" })).toBeVisible();
  await expect(page.getByText("Imaara Family Fellowship")).toBeVisible();

  await page.goto("/workspace/kings-grace/digital", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Communication & Digital Ministry" })).toBeVisible();
  await expect(page.getByText("Delivery failures")).toBeVisible();

  await page.goto("/workspace/kings-grace/digital/solco", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Solco Settings" })).toBeVisible();
  await expect(page.getByText("fake API result false")).toBeVisible();

  await page.goto("/workspace/kings-grace/digital/ai", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "AI Copilot" })).toBeVisible();
  await expect(page.getByText("No divine claims")).toBeVisible();
});
