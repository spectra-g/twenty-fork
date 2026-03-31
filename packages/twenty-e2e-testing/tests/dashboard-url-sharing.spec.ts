// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

const DASHBOARD_LINK_NAME = 'Mixed Graph Dashboard';
const OWNER_A_ID = '20202020-77d5-4cb6-b60a-f4a835a85d61';
const OWNER_B_ID = '20202020-77d5-4cb6-b60a-f4a835a85d62';
const START_DATE = '2026-03-01';
const END_DATE = '2026-03-15';
const STAGE = 'Proposal';

const openDashboard = async (page: Parameters<typeof test.skip>[1] extends (
  args: infer TArgs,
) => unknown
  ? TArgs['page']
  : never) => {
  await page.getByRole('link', { name: 'Dashboards' }).click();
  await page.getByRole('link', { name: DASHBOARD_LINK_NAME }).click();
};

test.describe.serial('Dashboard URL sharing', () => {
  test.skip(
    'encodes dashboard filters in the URL after a user changes them',
    async ({ page }) => {
      await openDashboard(page);

      await page
        .getByTestId('owner-filter-dropdown')
        .selectOption(OWNER_A_ID);
      await page.getByTestId('date-range-start-input').fill(START_DATE);
      await page.getByTestId('date-range-end-input').fill(END_DATE);
      await page.getByTestId('stage-filter').selectOption(STAGE);

      await expect(page).toHaveURL(
        new RegExp(
          [
            'dashboardFilter%5BownerId%5D=',
            OWNER_A_ID,
            '.*dashboardFilter%5BstartDate%5D=',
            START_DATE,
            '.*dashboardFilter%5BendDate%5D=',
            END_DATE,
            '.*dashboardFilter%5Bstage%5D=',
            STAGE,
          ].join(''),
        ),
      );
    },
  );

  test.skip(
    'hydrates dashboard filters from URL query params instead of preset defaults',
    async ({ page }) => {
      await openDashboard(page);

      const dashboardUrl = new URL(page.url());
      dashboardUrl.searchParams.set('dashboardFilter[ownerId]', OWNER_B_ID);
      dashboardUrl.searchParams.set('dashboardFilter[startDate]', START_DATE);
      dashboardUrl.searchParams.set('dashboardFilter[endDate]', END_DATE);
      dashboardUrl.searchParams.set('dashboardFilter[stage]', STAGE);

      await page.goto(dashboardUrl.toString());

      await expect(page.getByTestId('owner-filter-dropdown')).toHaveValue(
        OWNER_B_ID,
      );
      await expect(page.getByTestId('date-range-start-input')).toHaveValue(
        START_DATE,
      );
      await expect(page.getByTestId('date-range-end-input')).toHaveValue(
        END_DATE,
      );
      await expect(page.getByTestId('stage-filter')).toHaveValue(STAGE);
    },
  );

  test.skip(
    'allows a second user to open a shared dashboard URL and see the same filters',
    async ({ browser, page }) => {
      await openDashboard(page);

      await page
        .getByTestId('owner-filter-dropdown')
        .selectOption(OWNER_A_ID);
      await page.getByTestId('date-range-start-input').fill(START_DATE);
      await page.getByTestId('date-range-end-input').fill(END_DATE);
      await page.getByTestId('stage-filter').selectOption(STAGE);

      const sharedUrl = page.url();

      const secondContext = await browser.newContext();
      const secondPage = await secondContext.newPage();

      await secondPage.goto(sharedUrl);

      await expect(secondPage.getByTestId('owner-filter-dropdown')).toHaveValue(
        OWNER_A_ID,
      );
      await expect(
        secondPage.getByTestId('date-range-start-input'),
      ).toHaveValue(START_DATE);
      await expect(secondPage.getByTestId('date-range-end-input')).toHaveValue(
        END_DATE,
      );
      await expect(secondPage.getByTestId('stage-filter')).toHaveValue(STAGE);

      await secondContext.close();
    },
  );

  test.skip(
    'replaces dashboard filter query params when a hydrated filter changes without a full reload',
    async ({ page }) => {
      await openDashboard(page);

      const dashboardUrl = new URL(page.url());
      dashboardUrl.searchParams.set('dashboardFilter[ownerId]', OWNER_A_ID);
      dashboardUrl.searchParams.set('dashboardFilter[startDate]', START_DATE);
      dashboardUrl.searchParams.set('dashboardFilter[endDate]', END_DATE);
      await page.goto(dashboardUrl.toString());

      await page.getByTestId('stage-filter').selectOption(STAGE);

      await expect(page).toHaveURL(
        new RegExp(
          [
            'dashboardFilter%5BownerId%5D=',
            OWNER_A_ID,
            '.*dashboardFilter%5BstartDate%5D=',
            START_DATE,
            '.*dashboardFilter%5BendDate%5D=',
            END_DATE,
            '.*dashboardFilter%5Bstage%5D=',
            STAGE,
          ].join(''),
        ),
      );
      await expect(page.getByTestId('dashboard-filter-bar')).toBeVisible();
    },
  );
});
