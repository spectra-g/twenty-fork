// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard URL filters', () => {
  test.skip('AC-001 encodes dashboard filters into human-readable query params', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'Revenue Dashboard' }).click();

    await expect(page.getByRole('button', { name: 'Owner' })).toBeVisible();
    await page.getByRole('button', { name: 'Owner' }).click();
    await page.getByRole('option', { name: 'Sales Team' }).click();

    await expect(page).toHaveURL(
      /filter%5BownerId%5D%5BIS%5D=sales-team/,
      { timeout: 5000 },
    );
  });

  test.skip('AC-002 hydrates dashboard filters from the url on load', async ({
    page,
  }) => {
    await page.goto(
      '/dashboard/revenue-dashboard?filter%5BownerId%5D%5BIS%5D=sales-team&filter%5BdateRange%5D%5BIS%5D=last-7-days',
    );

    await expect(
      page.getByRole('button', { name: /Owner.*Sales Team/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Date Range.*Last 7 days/i }),
    ).toBeVisible();
    await expect(
      page.getByTestId('dashboard-chart-widget-1-filter-pill'),
    ).toContainText('Sales Team');
  });

  test.skip('AC-003 lets url filters override preset defaults on load', async ({
    page,
  }) => {
    await page.goto(
      '/dashboard/revenue-dashboard?presetId=preset-1&filter%5BdateRange%5D%5BIS%5D=last-7-days',
    );

    await expect(
      page.getByRole('button', { name: /Owner.*Sales Team/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Date Range.*Last 7 days/i }),
    ).toBeVisible();
    await expect(
      page.getByTestId('dashboard-chart-widget-1-filter-pill'),
    ).toContainText('Last 7 days');
  });
});
