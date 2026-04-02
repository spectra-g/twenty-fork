// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

const dashboardPath = `${process.env.LINK}/dashboard`;

test.describe('Dashboard chart filter composition API', () => {
  test.skip(
    'AC-002: chart data query forwards both globalFilters and local widget filters',
    async ({ page }) => {
      let chartDataRequest:
        | {
            operationName?: string;
            variables?: {
              input?: {
                globalFilters?: {
                  recordFilters?: Array<{ value?: string }>;
                  recordFilterGroups?: unknown[];
                };
                configuration?: {
                  filter?: {
                    recordFilters?: Array<{ value?: string }>;
                    recordFilterGroups?: unknown[];
                  };
                };
              };
            };
          }
        | undefined;

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
                  name: 'Revenue Dashboard',
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
                                  id: 'local-filter',
                                  fieldMetadataId: 'stage-field-id',
                                  value: 'OPEN',
                                  displayValue: 'Open',
                                  operand: 'IS',
                                  type: 'TEXT',
                                  label: 'Stage',
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

        if (request.operationName === 'BarChartData') {
          chartDataRequest = request;

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                barChartData: {
                  data: [{ stage: 'Open', amount: 2 }],
                  indexBy: 'stage',
                  keys: ['amount'],
                  series: [{ key: 'amount', label: 'Amount' }],
                  xAxisLabel: 'Stage',
                  yAxisLabel: 'Amount',
                  showLegend: true,
                  showDataLabels: false,
                  layout: 'VERTICAL',
                  groupMode: null,
                  hasTooManyGroups: false,
                  formattedToRawLookup: {},
                },
              },
            }),
          });

          return;
        }

        await route.fallback();
      });

      await page.goto(dashboardPath);

      expect(
        chartDataRequest?.variables?.input?.globalFilters?.recordFilters?.[0]
          ?.value,
      ).toBe('OPEN');
      expect(
        chartDataRequest?.variables?.input?.configuration?.filter
          ?.recordFilters?.[0]?.value,
      ).toBe('OPEN');
      await expect(page.getByText('Open')).toBeVisible();
    },
  );
});
