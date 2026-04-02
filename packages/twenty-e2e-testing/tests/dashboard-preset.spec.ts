// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

const dashboardPath = `${process.env.LINK}/dashboard`;

test.describe('Dashboard presets', () => {
  test.skip(
    'AC-001: user can save current filters as a named preset',
    async ({ page }) => {
      // @clawdence-stub: STORY-114 - Implement dashboard preset GraphQL mutations/queries for create, list, and apply operations with real persistence
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

        if (request.operationName === 'CreateDashboardPreset') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                createDashboardPreset: {
                  id: 'preset-my-preset',
                  name: 'My Preset',
                  filters: [
                    {
                      id: 'dashboard-global-filter-open',
                      fieldMetadataId: 'dashboard-global-filter-field-id',
                      value: 'OPEN',
                      displayValue: 'Open',
                      operand: 'IS',
                      type: 'TEXT',
                      label: 'Status',
                    },
                  ],
                  filterGroups: [],
                  createdAt: '2026-04-02T00:00:00.000Z',
                  updatedAt: '2026-04-02T00:00:00.000Z',
                },
              },
            }),
          });

          return;
        }

        await route.fallback();
      });

      await page.goto(dashboardPath);

      await page.getByTestId('dashboard-filter-toggle').click();
      await page.getByRole('button', { name: 'Presets' }).click();
      await page.getByRole('button', { name: 'Save Preset' }).click();
      await page.getByRole('textbox', { name: 'Preset name' }).fill('My Preset');
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(
        page.getByRole('button', { name: 'My Preset' }),
      ).toBeVisible();
    },
  );

  test.skip(
    'AC-002: user can apply a saved preset to update dashboard filters',
    async ({ page }) => {
      // @clawdence-stub: STORY-114 - Implement dashboard preset GraphQL mutations/queries for create, list, and apply operations with real persistence
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

        if (request.operationName === 'GetDashboardPresets') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                dashboardPresets: [
                  {
                    id: 'preset-q4-focus',
                    name: 'Q4 Focus',
                    filters: [
                      {
                        id: 'status-closed',
                        fieldMetadataId: 'dashboard-global-filter-field-id',
                        value: 'CLOSED',
                        displayValue: 'Closed',
                        operand: 'IS',
                        type: 'TEXT',
                        label: 'Status',
                      },
                    ],
                    filterGroups: [],
                    createdAt: '2026-04-02T00:00:00.000Z',
                    updatedAt: '2026-04-02T00:00:00.000Z',
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

      await page.getByRole('button', { name: 'Presets' }).click();
      await page.getByRole('button', { name: 'Q4 Focus' }).click();

      await expect(page.getByText('Closed')).toBeVisible();
      await expect(page.getByTestId('dashboard-filter-toggle')).toHaveCount(0);
    },
  );

  test.skip(
    'AC-003: user can save a preset with empty filter state',
    async ({ page }) => {
      // @clawdence-stub: STORY-114 - Implement dashboard preset GraphQL mutations/queries for create, list, and apply operations with real persistence
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

        if (request.operationName === 'CreateDashboardPreset') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                createDashboardPreset: {
                  id: 'preset-empty',
                  name: 'Empty Preset',
                  filters: [],
                  filterGroups: [],
                  createdAt: '2026-04-02T00:00:00.000Z',
                  updatedAt: '2026-04-02T00:00:00.000Z',
                },
              },
            }),
          });

          return;
        }

        await route.fallback();
      });

      await page.goto(dashboardPath);

      await page.getByRole('button', { name: 'Presets' }).click();
      await page.getByRole('button', { name: 'Save Preset' }).click();
      await page
        .getByRole('textbox', { name: 'Preset name' })
        .fill('Empty Preset');
      await page.getByRole('button', { name: 'Save' }).click();
      await page.getByTestId('dashboard-filter-toggle').click();
      await page.getByRole('button', { name: 'Presets' }).click();
      await page.getByRole('button', { name: 'Empty Preset' }).click();

      await expect(page.getByTestId('dashboard-filter-toggle')).toBeVisible();
      await expect(page.getByTestId('dashboard-global-filter')).toHaveCount(0);
    },
  );
});
