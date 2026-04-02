// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

const dashboardPath = `${process.env.LINK}/dashboard`;

test.describe('Dashboard permission-aware filters', () => {
  test.skip(
    'AC-001: restricted users only see permission-scoped results when global and local filters are applied',
    async ({ page }) => {
      const barChartRequests: unknown[] = [];

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
                            filter: {
                              recordFilters: [
                                {
                                  fieldMetadataId: 'department-field-id',
                                  operand: 'IS',
                                  value: 'SALES',
                                },
                              ],
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

        if (request.operationName === 'GetBarChartData') {
          barChartRequests.push(request.variables);

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                getBarChartData: [
                  {
                    label: 'Sales',
                    value: 3,
                  },
                ],
              },
            }),
          });

          return;
        }

        await route.fallback();
      });

      await page.goto(dashboardPath);

      await expect(page.getByText('Sales')).toBeVisible();
      await expect(page.getByText('Finance')).toHaveCount(0);
      await expect.poll(() => barChartRequests.length).toBeGreaterThan(0);
      expect(JSON.stringify(barChartRequests[0])).toContain('SALES');
      expect(JSON.stringify(barChartRequests[0])).not.toContain('FINANCE');
    },
  );
});
