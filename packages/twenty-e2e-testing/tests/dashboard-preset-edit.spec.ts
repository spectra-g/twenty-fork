// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';
import { LoginPage } from '../lib/pom/loginPage';

test.skip(
  'shows rename and delete affordances for a user who can edit a dashboard preset',
  async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto('/');
    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.clickContinueButton();
    await loginPage.clickSignInButton();

    await page.goto('/dashboard/dashboard-owned-preset');
    await page.getByRole('button', { name: 'Preset:empty' }).click();
    await page.getByRole('button', { name: 'Rename Preset' }).click();

    await expect(
      page.getByRole('button', { name: 'Delete Preset' }),
    ).toBeVisible();
    await expect(page.getByLabel('Preset name')).toHaveValue(
      'Owned Pipeline Preset',
    );
  },
);

test.skip(
  'hides rename and delete affordances for a user without preset edit rights',
  async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto('/');
    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.clickContinueButton();
    await loginPage.clickSignInButton();

    await page.goto('/dashboard/dashboard-read-only-preset');
    await page.getByRole('button', { name: 'Preset:empty' }).click();

    await expect(
      page.getByRole('button', { name: 'Rename Preset' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Delete Preset' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Preset:Shared Revenue Preset' }),
    ).toBeVisible();
  },
);

test.skip(
  'renames a preset with immediate UI feedback and keeps the new name after reload',
  async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto('/');
    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.clickContinueButton();
    await loginPage.clickSignInButton();

    await page.goto('/dashboard/dashboard-owned-preset');
    await page.getByRole('button', { name: 'Preset:empty' }).click();
    await page.getByRole('button', { name: 'Rename Preset' }).click();
    await page.getByLabel('Preset name').fill('Renamed Pipeline Preset');
    await page.getByRole('button', { name: 'Save Preset Name' }).click();

    await expect(
      page.getByRole('button', { name: 'Preset:Renamed Pipeline Preset' }),
    ).toBeVisible();

    await page.reload();

    await expect(
      page.getByRole('button', { name: 'Preset:Renamed Pipeline Preset' }),
    ).toBeVisible();
  },
);

test.skip(
  'deletes a preset, removes it from selection, and prevents reselection',
  async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto('/');
    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.clickContinueButton();
    await loginPage.clickSignInButton();

    await page.goto('/dashboard/dashboard-owned-preset');
    await page.getByRole('button', { name: 'Preset:empty' }).click();
    await page.getByRole('button', { name: 'Delete Preset' }).click();

    await expect(
      page.getByRole('button', { name: 'Preset:Owned Pipeline Preset' }),
    ).not.toBeVisible();
    await expect(
      page.getByText('Owned Pipeline Preset', { exact: true }),
    ).not.toBeVisible();
  },
);
