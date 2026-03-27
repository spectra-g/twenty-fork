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
});
