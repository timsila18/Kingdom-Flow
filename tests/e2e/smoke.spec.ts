import { expect, test } from "@playwright/test";

test("loads public entry points without exposing demo accounts", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "KingdomFlow" })).toBeVisible();
  await expect(page.getByAltText("KingdomFlow").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();

  await page.goto("/auth/sign-in");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: /test logins/i })).toHaveCount(0);

  await page.goto("/auth/test-logins");
  await expect(page.getByRole("heading", { name: "Test logins removed" })).toBeVisible();
  await expect(page.getByRole("link", { name: /sign in and open area/i })).toHaveCount(0);

  await page.goto("/auth/demo-login?email=removed%40example.org");
  await expect(page).toHaveURL(/\/auth\/sign-in\?error=demo-disabled/);
  await expect(page.getByText("Demo accounts are no longer available.")).toBeVisible();
});

test("captures a church registration and keeps platform access protected", async ({ page }) => {
  test.setTimeout(120_000);

  const suffix = Date.now().toString().slice(-6);
  const churchName = `Registered Church ${suffix}`;
  const slug = `registered-church-${suffix}`;

  await page.goto("/onboarding");
  await expect(page.getByLabel("Ministry / church name")).toHaveValue("");
  await page.getByLabel("Ministry / church name").fill(churchName);
  await page.getByLabel("Legal name").fill(`${churchName} Church`);
  await page.getByLabel("Preferred workspace slug").fill(slug);
  await page.getByLabel("Church contact email").fill(`${slug}@example.org`);
  await page.getByLabel("Principal leader name").fill("Authorized Leader");
  await page.getByLabel("Departments to create").fill("Worship\nMedia\nDiscipleship\nPastoral Care");
  await page.getByLabel("Programmes to start with").fill("Foundation Class\nDiscipleship\nMembership Class");
  await page.getByLabel("I am authorized to register this church.").check();
  await page.getByLabel("The church controls its ministry data.").check();
  await page.getByLabel("KingdomFlow is a technology platform, not a spiritual authority.").check();
  await page.getByLabel("The information provided is accurate enough for platform review.").check();
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page).toHaveURL(/\/auth\/pending/);
  await expect(page.getByText(churchName)).toBeVisible();

  await page.goto("/platform");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});
