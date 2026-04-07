// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '@playwright/test';

test.describe.skip('dashboard preset controls', () => {
  test('AC-001 opens the save preset dialog from the dashboard preset menu', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByLabel('Email').fill('tim@apple.dev');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('button', { name: 'Presets' }).click();
    await page.getByRole('button', { name: 'Save preset' }).click();

    await expect(
      page.getByRole('heading', { name: 'Save preset' }),
    ).toBeVisible();
    await expect(page.getByLabel('Preset name')).toBeVisible();
  });

  test('AC-002 lists saved presets and supports rename/delete actions', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByLabel('Email').fill('tim@apple.dev');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Presets' }).click();

    await expect(page.getByText('Open deals')).toBeVisible();
    await expect(page.getByText('Closed deals')).toBeVisible();

    await page.getByRole('button', { name: 'Rename Open deals' }).click();
    await page.getByLabel('Preset name').fill('Open pipeline');
    await page.getByRole('button', { name: 'Save rename' }).click();

    await expect(page.getByText('Open pipeline')).toBeVisible();

    await page.getByRole('button', { name: 'Delete Closed deals' }).click();
    await expect(page.getByText('Closed deals')).not.toBeVisible();
  });

  test('AC-003 generates and copies a shareable URL with encoded filter state', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByLabel('Email').fill('tim@apple.dev');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('button', { name: 'Share' }).click();

    await expect(page).toHaveURL(/filter%5Bstatus%5D%5BIS%5D=OPEN/);

    const clipboardText = await page.evaluate(async () =>
      navigator.clipboard.readText(),
    );

    expect(clipboardText).toContain('filter%5Bstatus%5D%5BIS%5D=OPEN');
  });
});
