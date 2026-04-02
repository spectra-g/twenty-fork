// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

const dashboardPath = `${process.env.LINK}/dashboard`;

test.describe('Dashboard URL sharing', () => {
  test.skip('AC-001: changing a dashboard global filter updates the URL with serialized filter params', async ({
    page,
  }) => {
    await page.goto(dashboardPath);

    await page.getByTestId('dashboard-filter-toggle').click();

    await expect(page).toHaveURL(/filter%5Bstatus%5D%5BIS%5D=OPEN/);
    await expect(page.getByTestId('dashboard-global-filter')).toBeVisible();
  });

  test.skip('AC-002: loading a dashboard URL with filter params hydrates the filter bar state', async ({
    page,
  }) => {
    await page.goto(`${dashboardPath}?filter[status][IS]=OPEN`);

    await expect(page.getByTestId('dashboard-global-filter')).toBeVisible();
    await expect(page.getByText('OPEN')).toBeVisible();
  });

  test.skip('AC-003: dashboard widgets query using URL-hydrated global filters', async ({
    page,
  }) => {
    await page.goto(`${dashboardPath}?filter[status][IS]=OPEN`);

    await expect(page.getByText('OPEN')).toBeVisible();
    await expect(page.getByText('Pipeline by Stage')).toBeVisible();
  });
});
