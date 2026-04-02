// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

const dashboardPath = `${process.env.LINK}/dashboard`;

test.describe('Dashboard filter bar', () => {
  test.skip(
    'AC-001: shows the global filter bar when dashboard filter support is enabled',
    async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const request = route.request().postDataJSON();

        if (request.operationName === 'FindOnePageLayout') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                getPageLayout: {
                  id: 'dashboard-layout-id',
                  name: 'Sales Dashboard',
                  type: 'DASHBOARD',
                  objectMetadataId: 'opportunity-object-id',
                  filterSupport: true,
                  defaultTabToFocusOnMobileAndSidePanelId: 'tab-1',
                  createdAt: '2026-04-02T00:00:00.000Z',
                  updatedAt: '2026-04-02T00:00:00.000Z',
                  tabs: [
                    {
                      id: 'tab-1',
                      applicationId: 'app-1',
                      title: 'Overview',
                      icon: 'IconChartBar',
                      position: 0,
                      layoutMode: 'GRID',
                      pageLayoutId: 'dashboard-layout-id',
                      createdAt: '2026-04-02T00:00:00.000Z',
                      updatedAt: '2026-04-02T00:00:00.000Z',
                      widgets: [],
                    },
                  ],
                },
              },
            }),
          });

          return;
        }

        await route.fallback();
      });

      await page.goto(dashboardPath);

      await expect(page.getByTestId('dashboard-filter-bar')).toBeVisible();
    },
  );

  test.skip(
    'AC-002: selecting a global filter updates graph widget data',
    async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const request = route.request().postDataJSON();

        if (request.operationName === 'FindOnePageLayout') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                getPageLayout: {
                  id: 'dashboard-layout-id',
                  name: 'Sales Dashboard',
                  type: 'DASHBOARD',
                  objectMetadataId: 'opportunity-object-id',
                  filterSupport: true,
                  defaultTabToFocusOnMobileAndSidePanelId: 'tab-1',
                  createdAt: '2026-04-02T00:00:00.000Z',
                  updatedAt: '2026-04-02T00:00:00.000Z',
                  tabs: [
                    {
                      id: 'tab-1',
                      applicationId: 'app-1',
                      title: 'Overview',
                      icon: 'IconChartBar',
                      position: 0,
                      layoutMode: 'GRID',
                      pageLayoutId: 'dashboard-layout-id',
                      createdAt: '2026-04-02T00:00:00.000Z',
                      updatedAt: '2026-04-02T00:00:00.000Z',
                      widgets: [
                        {
                          id: 'widget-1',
                          title: 'Pipeline by Stage',
                          type: 'GRAPH',
                          objectMetadataId: 'opportunity-object-id',
                          pageLayoutTabId: 'tab-1',
                          createdAt: '2026-04-02T00:00:00.000Z',
                          updatedAt: '2026-04-02T00:00:00.000Z',
                          deletedAt: null,
                          gridPosition: {
                            row: 0,
                            column: 0,
                            rowSpan: 4,
                            columnSpan: 6,
                          },
                          configuration: {
                            __typename: 'BarChartConfiguration',
                            configurationType: 'BAR_CHART',
                            aggregateFieldMetadataId: 'amount-field-id',
                            aggregateOperation: 'SUM',
                            primaryAxisGroupByFieldMetadataId: 'stage-field-id',
                            primaryAxisOrderBy: 'FIELD_ASC',
                            layout: 'VERTICAL',
                            filter: { recordFilters: [], recordFilterGroups: [] },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            }),
          });

          return;
        }

        if (request.operationName === 'GetBarChartData') {
          const hasGlobalFilter =
            JSON.stringify(request.variables?.filter ?? {}).includes(
              'OPEN',
            );

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                getBarChartData: hasGlobalFilter
                  ? [{ label: 'Open', value: 2 }]
                  : [{ label: 'All', value: 5 }],
              },
            }),
          });

          return;
        }

        await route.fallback();
      });

      await page.goto(dashboardPath);

      await expect(page.getByText('All')).toBeVisible();
      await page.getByTestId('dashboard-filter-toggle').click();
      await expect(page.getByText('Open')).toBeVisible();
    },
  );

  test.skip(
    'AC-003: hides the global filter bar when dashboard filter support is disabled',
    async ({ page }) => {
      await page.route('**/graphql', async (route) => {
        const request = route.request().postDataJSON();

        if (request.operationName === 'FindOnePageLayout') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                getPageLayout: {
                  id: 'dashboard-layout-id',
                  name: 'Sales Dashboard',
                  type: 'DASHBOARD',
                  objectMetadataId: 'opportunity-object-id',
                  filterSupport: false,
                  defaultTabToFocusOnMobileAndSidePanelId: 'tab-1',
                  createdAt: '2026-04-02T00:00:00.000Z',
                  updatedAt: '2026-04-02T00:00:00.000Z',
                  tabs: [
                    {
                      id: 'tab-1',
                      applicationId: 'app-1',
                      title: 'Overview',
                      icon: 'IconChartBar',
                      position: 0,
                      layoutMode: 'GRID',
                      pageLayoutId: 'dashboard-layout-id',
                      createdAt: '2026-04-02T00:00:00.000Z',
                      updatedAt: '2026-04-02T00:00:00.000Z',
                      widgets: [],
                    },
                  ],
                },
              },
            }),
          });

          return;
        }

        await route.fallback();
      });

      await page.goto(dashboardPath);

      await expect(page.getByTestId('dashboard-filter-bar')).toHaveCount(0);
    },
  );
});
