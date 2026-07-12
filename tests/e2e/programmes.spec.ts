import { expect, test } from "@playwright/test";

test("programmes Prompt 6 surfaces render core workflows", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/workspace/kings-grace/programmes", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Discipleship & Classes" })).toBeVisible();
  await expect(page.getByText("Active programmes")).toBeVisible();

  await page.goto("/workspace/kings-grace/programmes/catalogue", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Programme Catalogue" })).toBeVisible();
  await expect(page.getByText("Total payable: KES 360 · Tech fee: KES 10")).toBeVisible();

  await page.goto("/workspace/kings-grace/programmes/payments", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Programme Payments" })).toBeVisible();
  await expect(page.getByText("No fake online success")).toBeVisible();

  await page.goto("/workspace/kings-grace/programmes/certificates", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Certificates" })).toBeVisible();
  await expect(page.getByText("Verify certificate")).toBeVisible();

  await page.goto("/verify/certificates/KFCERT-FF-JOHN-001", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Certificate Verification" })).toBeVisible();
  await expect(page.getByText("KGC-FF-0001")).toBeVisible();
});
