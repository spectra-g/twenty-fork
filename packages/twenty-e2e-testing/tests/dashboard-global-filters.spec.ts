import { expect, test } from '../lib/fixtures/screenshot';

const DASHBOARD_ID = 'dashboard-global-filters-e2e';

const openDashboardShowPage = async (page: Parameters<typeof test>[0]['page']) => {
  await page.goto(`/objects/dashboards/${DASHBOARD_ID}`);
};

test.describe('Dashboard global filters', () => {
  test('AC-001: shows global filter bar above widget area', async ({ page }) => {
    await openDashboardShowPage(page);

    const filterBar = page.getByTestId('global-filter-bar');
    const widgetArea = page.getByTestId('dashboard-widget-content');

    await expect(filterBar).toBeVisible();
    await expect(widgetArea).toBeVisible();

    const filterBox = await filterBar.boundingBox();
    const widgetBox = await widgetArea.boundingBox();

    expect(filterBox).not.toBeNull();
    expect(widgetBox).not.toBeNull();
    expect((filterBox?.y ?? 0) + (filterBox?.height ?? 0)).toBeLessThan(
      widgetBox?.y ?? 0,
    );
  });

  test('AC-002: selecting preset updates active filters and refresh key', async ({
    page,
  }) => {
    await openDashboardShowPage(page);

    const widgetArea = page.getByTestId('dashboard-widget-content');

    const previousRefreshKey = await widgetArea.getAttribute(
      'data-filter-refresh-key',
    );

    await page.getByTestId('global-filter-preset-select').selectOption('recent');

    await expect(page.getByTestId('global-filter-active-preset')).toHaveText(
      'Recent',
    );

    const updatedRefreshKey = await widgetArea.getAttribute(
      'data-filter-refresh-key',
    );
    expect(updatedRefreshKey).not.toBe(previousRefreshKey);
  });

  test('AC-003: URL restores active preset state', async ({ page, context }) => {
    await openDashboardShowPage(page);

    await page.getByTestId('global-filter-preset-select').selectOption('recent');

    await expect(page).toHaveURL(/globalFilterPresetId=recent/);

    const sharedUrl = page.url();
    const newPage = await context.newPage();

    await newPage.goto(sharedUrl);

    await expect(newPage.getByTestId('global-filter-active-preset')).toHaveText(
      'Recent',
    );
  });

  test('AC-004: read-only dashboards keep preset selector disabled', async ({
    page,
  }) => {
    await page.goto(`/objects/dashboards/${DASHBOARD_ID}?readonly=1`);

    await expect(page.getByTestId('global-filter-preset-select')).toBeDisabled();
    await expect(page.getByTestId('global-filter-edit-controls')).toHaveCount(0);
  });
});
