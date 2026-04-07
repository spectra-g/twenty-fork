// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '@playwright/test';

test.describe.skip('dashboard preset permissions', () => {
  test('AC-001 keeps filters available while hiding preset management for a user without edit permission', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByLabel('Email').fill('readonly.dashboard@apple.dev');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.goto('/dashboard');

    await expect(page.getByRole('button', { name: 'Add filter' })).toBeVisible();
    await page.getByRole('button', { name: 'Add filter' }).click();
    await expect(page.getByText('Status is Open')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Presets' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Save preset' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: /Rename / }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: /Delete / }),
    ).not.toBeVisible();
  });

  test('AC-003 shows full preset management controls for a user with edit permission', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByLabel('Email').fill('tim@apple.dev');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Presets' }).click();

    await expect(
      page.getByRole('button', { name: 'Save preset' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Rename / }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Delete / }),
    ).toBeVisible();
  });
});
