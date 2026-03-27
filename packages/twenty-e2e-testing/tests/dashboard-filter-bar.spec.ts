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
    'should render the owner filter dropdown with workspace member options',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Pipeline dashboard' }).click();

      await expect(page.getByTestId('dashboard-filter-bar')).toBeVisible();

      await page.getByRole('button', { name: 'Owner filter' }).click();

      await expect(
        page.getByRole('option', { name: 'Me' }),
      ).toBeVisible();
      await expect(
        page.getByRole('option', { name: 'Ada Lovelace' }),
      ).toBeVisible();
      await expect(
        page.getByRole('option', { name: 'Grace Hopper' }),
      ).toBeVisible();
    },
  );

  test.skip(
    'should render the date filter input with calendar and relative date options',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Pipeline dashboard' }).click();

      await expect(page.getByTestId('dashboard-filter-bar')).toBeVisible();

      await page.getByRole('button', { name: 'Created at filter' }).click();

      await expect(
        page.getByRole('grid', { name: /calendar/i }),
      ).toBeVisible();
      await expect(page.getByTestId('dashboard-widget-chart')).toBeVisible();
      await expect(page.getByText('Last 7 days')).toBeVisible();
      await expect(page.getByText('This month')).toBeVisible();
    },
  );

  test.skip(
    'should update dashboard charts from the intersection of owner and date filters with widget-local filters',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Pipeline dashboard' }).click();

      await expect(page.getByTestId('dashboard-filter-bar')).toBeVisible();
      await expect(page.getByTestId('dashboard-widget-chart')).toBeVisible();

      await page.getByRole('button', { name: 'Owner filter' }).click();
      await page.getByRole('option', { name: 'Ada Lovelace' }).click();

      await page.getByRole('button', { name: 'Created at filter' }).click();
      await page.getByText('Last 7 days').click();

      await expect(
        page.getByRole('button', { name: /ownerada lovelace/i }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /created atlast 7 days/i }),
      ).toBeVisible();
      await expect(page.getByTestId('dashboard-widget-chart')).toBeVisible();
      await expect(
        page.getByTestId('dashboard-widget-chart-empty-state'),
      ).toBeVisible();
    },
  );
});
