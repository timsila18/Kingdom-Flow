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

test("completes the church onboarding to discipleship journey without route failures", async ({ page }) => {
  test.setTimeout(120_000);

  const suffix = Date.now().toString().slice(-6);
  const churchName = `E2E Grace ${suffix}`;
  const slug = `e2e-grace-${suffix}`;

  await page.goto("/auth/demo-login?email=superadmin%40kingdomflow.co.ke");
  await page.goto("/onboarding");
  await page.getByLabel("Ministry / church name").fill(churchName);
  await page.getByLabel("Legal name").fill(`${churchName} Church`);
  await page.getByLabel("Preferred workspace slug").fill(slug);
  await page.getByLabel("Church contact email").fill(`${slug}@example.test`);
  await page.getByLabel("Principal leader name").fill("Pastor Test Leader");
  await page.getByLabel("Departments to create").fill("Worship\nMedia\nDiscipleship\nPastoral Care");
  await page.getByLabel("Programmes to start with").fill("Foundation Class\nDiscipleship\nMembership Class");
  await page.getByLabel("I am authorized to register this church.").check();
  await page.getByLabel("The church controls its ministry data.").check();
  await page.getByLabel("KingdomFlow is a technology platform, not a spiritual authority.").check();
  await page.getByLabel("The information provided is accurate enough for platform review.").check();
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page).toHaveURL(/\/auth\/pending/);

  await page.goto("/platform");
  await expect(page.getByText(churchName)).toBeVisible();
  await page.getByRole("row").filter({ hasText: churchName }).getByRole("link", { name: "Inspect" }).click();
  await expect(page.getByRole("heading", { name: churchName })).toBeVisible();
  await expect(page.getByText("Leadership & Governance")).toBeVisible();
  await expect(page.getByText("Discipleship")).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page).toHaveURL(new RegExp(`/platform/churches/${slug}.*updated=approved`));

  await page.goto(`/workspace/${slug}`);
  await expect(page.getByRole("heading", { name: `${churchName} home` })).toBeVisible();
  await expect(page.getByText(`Workspace: ${churchName}`)).toBeVisible();

  await page.goto(`/workspace/${slug}/organization`);
  await page.getByPlaceholder("Unit name").fill("Discipleship Department");
  await page.getByPlaceholder("Code").fill("DISC");
  await page.getByRole("button", { name: "Create audited unit" }).click();
  await expect(page).toHaveURL(new RegExp(`/workspace/${slug}/organization.*done=unit-created`));

  await page.goto(`/workspace/${slug}/users`);
  await page.getByPlaceholder("Email address").fill("worker@example.test");
  await page.getByRole("button", { name: "Create secure invitation" }).click();
  await expect(page).toHaveURL(new RegExp(`/workspace/${slug}/users.*done=invitation-created`));

  await page.goto(`/workspace/${slug}/people/new-converts`);
  await expect(page.getByRole("heading", { name: "New Converts" })).toBeVisible();
  await page.goto(`/workspace/${slug}/people/follow-up`);
  await expect(page.getByRole("heading", { name: "Follow-Up Dashboard" })).toBeVisible();
  await page.goto(`/workspace/${slug}/programmes`);
  await expect(page.getByRole("heading", { name: "Discipleship & Classes" })).toBeVisible();
  await page.goto(`/workspace/${slug}/programmes/catalogue`);
  await expect(page.getByRole("heading", { name: "Programme Catalogue" })).toBeVisible();
  await page.goto(`/workspace/${slug}/groups`);
  await expect(page.getByRole("heading", { name: "Cells & Fellowships" })).toBeVisible();
});
