// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard Filters', () => {
  test.skip('AC-001 applies an owner filter to every chart widget on the dashboard', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Dashboards' }).click();
    await page.getByRole('link', { name: 'Revenue Dashboard' }).click();

    await expect(page.getByText('Owner')).toBeVisible();
    await expect(page.getByTestId('dashboard-chart-widget-1')).toBeVisible();
    await expect(page.getByTestId('dashboard-chart-widget-2')).toBeVisible();

    await page.getByRole('button', { name: 'Owner' }).click();
    await page.getByRole('option', { name: 'Sales Team' }).click();

    await expect(
      page.getByTestId('dashboard-chart-widget-1-filter-pill'),
    ).toHaveText('Sales Team', {
      timeout: 2000,
    });
    await expect(
      page.getByTestId('dashboard-chart-widget-2-filter-pill'),
    ).toHaveText('Sales Team', {
      timeout: 2000,
    });
  });

  test.skip('AC-002 keeps filter state isolated per dashboard', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Dashboards' }).click();
    await page.getByRole('link', { name: 'Revenue Dashboard' }).click();

    await page.getByRole('button', { name: 'Owner' }).click();
    await page.getByRole('option', { name: 'Sales Team' }).click();
    await expect(page.getByRole('button', { name: /Sales Team/ })).toBeVisible();

    await page.getByRole('link', { name: 'Marketing Dashboard' }).click();

    await expect(page.getByRole('button', { name: /Owner/ })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Sales Team/ }),
    ).not.toBeVisible();
    await expect(
      page.getByTestId('dashboard-chart-widget-1-filter-pill'),
    ).not.toContainText('Sales Team');
  });

  test.skip('AC-003 shows a disabled loading state while presets are loading', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.route('**/graphql', async (route) => {
      await route.continue();
    });

    await page.getByRole('link', { name: 'Dashboards' }).click();
    await page.getByRole('link', { name: 'Revenue Dashboard' }).click();

    await expect(page.getByRole('button', { name: 'Owner' })).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Date Range' }),
    ).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Stage' })).toBeDisabled();
    await expect(consoleErrors).toEqual([]);
  });
});
