// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard invalid shared filter fallback', () => {
  test.skip('AC-001 falls back to the default dashboard state when the shared filter params are malformed', async ({
    page,
  }) => {
    await page.goto('/dashboard/revenue-dashboard?filter%5BownerId%5D=sales-team');

    await expect(page.getByRole('button', { name: 'Owner' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Owner.*sales-team/i }),
    ).not.toBeVisible();
    await expect(page).toHaveURL('/dashboard/revenue-dashboard');
  });

  test.skip('AC-002 shows a non-blocking snackbar when shared filter params cannot be applied', async ({
    page,
  }) => {
    await page.goto('/dashboard/revenue-dashboard?filter%5BownerId%5D=sales-team');

    await expect(
      page.getByText('Shared filters could not be applied'),
    ).toBeVisible();
  });

  test.skip('AC-003 falls back to the default dashboard state when the shared preset reference is expired', async ({
    page,
  }) => {
    await page.goto('/dashboard/revenue-dashboard?presetId=missing-preset');

    await expect(page.getByRole('button', { name: 'Owner' })).toBeVisible();
    await expect(
      page.getByText('Shared filters could not be applied'),
    ).toBeVisible();
    await expect(page).toHaveURL('/dashboard/revenue-dashboard');
  });
});
