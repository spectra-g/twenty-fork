// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

const dashboardPath = `${process.env.LINK}/dashboard`;

test.describe('Legacy dashboard backward compatibility', () => {
  test.skip(
    'AC-001: hides global filters for a legacy dashboard without persisted filter config and keeps widgets rendering default data',
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
                  id: 'legacy-dashboard-layout-id',
                  name: 'Legacy Dashboard',
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
                      pageLayoutId: 'legacy-dashboard-layout-id',
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
      await expect(page.getByText('Overview')).toBeVisible();
    },
  );

  test.skip(
    'AC-002: does not expose global filter UI or chart filter APIs when IS_DASHBOARD_V2_ENABLED is disabled',
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
                  name: 'Dashboard V2 Disabled',
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

        if (request.operationName === 'GetBarChartData') {
          expect(request.variables?.input?.globalFilters).toBeUndefined();
        }

        await route.fallback();
      });

      await page.goto(
        `${dashboardPath}?filter[status][IS]=OPEN&filterBarEnabled=true`,
      );

      await expect(page.getByTestId('dashboard-filter-bar')).toHaveCount(0);
      await expect(page.getByText('Overview')).toBeVisible();
    },
  );

  test.skip(
    'AC-003: gracefully degrades to legacy rendering when a dashboard has stored filters but IS_DASHBOARD_V2_ENABLED is disabled',
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
                  name: 'Stored Filters Dashboard',
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
                      widgets: [
                        {
                          id: 'widget-1',
                          title: 'Pipeline',
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
                            filter: {
                              recordFilters: [],
                              recordFilterGroups: [],
                            },
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

        await route.fallback();
      });

      await page.goto(`${dashboardPath}?filter[stage][IS]=WON`);

      await expect(page.getByTestId('dashboard-filter-bar')).toHaveCount(0);
      await expect(page.getByText('Overview')).toBeVisible();
    },
  );
});
