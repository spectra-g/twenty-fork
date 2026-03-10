import { expect, test } from '../lib/fixtures/screenshot';
import { type Page } from '@playwright/test';

const openDashboardPage = async (page: Page) => {
  await page.goto(process.env.LINK ?? '/');

  const dashboardsLink = page.getByRole('link', { name: /Dashboards/i });

  await expect(dashboardsLink).toBeVisible();
  await dashboardsLink.click();

  const firstDashboardLink = page.getByRole('link').filter({ hasText: /Dashboard/i }).first();

  await expect(firstDashboardLink).toBeVisible();
  await firstDashboardLink.click();
};

test('AC-001: shows and allows interaction with dashboard filter controls', async ({
  page,
}) => {
  await openDashboardPage(page);

  await page.getByTestId('dashboard-filter-panel-toggle').click();

  const ownerFilter = page.getByTestId('dashboard-filter-owner-select');
  const dateRangeFilter = page.getByTestId('dashboard-filter-date-range-select');
  const stageFilter = page.getByTestId('dashboard-filter-stage-select');

  await expect(ownerFilter).toBeVisible();
  await expect(dateRangeFilter).toBeVisible();
  await expect(stageFilter).toBeVisible();

  await ownerFilter.selectOption('John');
  await dateRangeFilter.selectOption('LAST_30_DAYS');
  await stageFilter.selectOption('Won');

  await expect(ownerFilter).toHaveValue('John');
  await expect(dateRangeFilter).toHaveValue('LAST_30_DAYS');
  await expect(stageFilter).toHaveValue('Won');
});

test('AC-002: propagates dashboard filter values to graph widget queries', async ({
  page,
}) => {
  await openDashboardPage(page);

  await page.getByTestId('dashboard-filter-panel-toggle').click();

  await page.getByTestId('dashboard-filter-owner-select').selectOption('John');
  await page
    .getByTestId('dashboard-filter-date-range-select')
    .selectOption('LAST_30_DAYS');
  await page.getByTestId('dashboard-filter-stage-select').selectOption('Won');

  const widgetRequest = await page.waitForRequest((request) => {
    if (!request.url().endsWith('/graphql') || request.method() !== 'POST') {
      return false;
    }

    const payload = request.postDataJSON();

    return (
      payload?.operationName === 'BarChartData' ||
      payload?.operationName === 'LineChartData' ||
      payload?.operationName === 'PieChartData'
    );
  });

  const payload = widgetRequest.postDataJSON();
  const recordFilters =
    payload?.variables?.input?.configuration?.filter?.recordFilters ?? [];

  const recordFilterValues = recordFilters.map(
    (recordFilter: { value: string }) => recordFilter.value,
  );

  expect(recordFilterValues).toEqual(
    expect.arrayContaining(['John', 'LAST_30_DAYS', 'Won']),
  );
});
