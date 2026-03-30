// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard Filter Bar', () => {
  test.skip('shows owner dropdown in filter bar', async ({ page }) => {
    await page.getByRole('link', { name: 'Dashboards' }).click();
    await page.getByRole('link', { name: 'Mixed Graph Dashboard' }).click();

    await expect(page.getByTestId('dashboard-filter-bar')).toBeVisible();
    await expect(page.getByTestId('owner-filter-dropdown')).toBeVisible();
  });

  test.skip('shows date range and stage controls', async ({ page }) => {
    await page.getByRole('link', { name: 'Dashboards' }).click();
    await page.getByRole('link', { name: 'Mixed Graph Dashboard' }).click();

    await expect(page.getByTestId('date-range-filter')).toBeVisible();
    await expect(page.getByTestId('stage-filter')).toBeVisible();
  });

  test.skip('changing owner triggers widget refresh', async ({ page }) => {
    await page.getByRole('link', { name: 'Dashboards' }).click();
    await page.getByRole('link', { name: 'Mixed Graph Dashboard' }).click();

    await page
      .getByTestId('owner-filter-dropdown')
      .selectOption('20202020-77d5-4cb6-b60a-f4a835a85d61');

    await expect(page.getByTestId('owner-filter-dropdown')).toHaveValue(
      '20202020-77d5-4cb6-b60a-f4a835a85d61',
    );
    await expect(page.getByTestId('widget-refreshing').first()).toBeVisible();
  });

  test.skip('changing date range triggers widget refresh', async ({ page }) => {
    await page.getByRole('link', { name: 'Dashboards' }).click();
    await page.getByRole('link', { name: 'Mixed Graph Dashboard' }).click();

    await page.getByTestId('date-range-start-input').fill('2026-03-01');
    await page.getByTestId('date-range-end-input').fill('2026-03-15');

    await expect(page.getByTestId('date-range-filter-value')).toContainText(
      '1 Mar, 2026 - 15 Mar, 2026',
    );
    await expect(page.getByTestId('widget-refreshing').first()).toBeVisible();
  });

  test.skip('filter bar hidden on non-dashboard pages', async ({ page }) => {
    await page.getByRole('link', { name: 'People' }).click();
    await page.getByRole('gridcell').first().click();

    await expect(page.getByTestId('dashboard-filter-bar')).not.toBeVisible();
  });
});
