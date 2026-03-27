// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard Filter Bar', () => {
  test.skip(
    'should display the dashboard filter bar on a dashboard record page',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Pipeline dashboard' }).click();

      await expect(page.getByTestId('dashboard-filter-bar')).toBeVisible();
    },
  );

  test.skip(
    'should show the selected stage as an active filter chip',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Pipeline dashboard' }).click();

      await expect(page.getByTestId('dashboard-filter-bar')).toBeVisible();

      await page.getByRole('combobox', { name: 'Stage filter' }).selectOption({
        label: 'Qualified',
      });

      await expect(
        page.getByRole('button', { name: /stagequalified/i }),
      ).toBeVisible();
    },
  );

  test.skip(
    'should update dashboard charts from the intersection of global and widget stage filters',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Pipeline dashboard' }).click();

      await expect(page.getByTestId('dashboard-filter-bar')).toBeVisible();

      await page.getByRole('combobox', { name: 'Stage filter' }).selectOption({
        label: 'Qualified',
      });

      await expect(
        page.getByRole('button', { name: /stagequalified/i }),
      ).toBeVisible();
      await expect(
        page.getByTestId('dashboard-widget-chart-empty-state'),
      ).toBeVisible();
    },
  );

  test.skip(
    'should ignore dashboard filters that do not apply to a widget object',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Pipeline dashboard' }).click();

      await expect(page.getByTestId('dashboard-filter-bar')).toBeVisible();

      await page.getByRole('combobox', { name: 'Company filter' }).selectOption({
        label: 'Acme',
      });

      await expect(
        page.getByRole('button', { name: /companyacme/i }),
      ).toBeVisible();
      await expect(page.getByTestId('dashboard-widget-chart')).toBeVisible();
      await expect(
        page.getByTestId('dashboard-widget-chart-empty-state'),
      ).not.toBeVisible();
    },
  );
});
