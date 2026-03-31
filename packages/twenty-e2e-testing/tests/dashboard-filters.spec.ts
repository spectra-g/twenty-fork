// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard Filters GraphQL Contract', () => {
  test.skip(
    'loads dashboard filters and presets through the metadata GraphQL API',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Mixed Graph Dashboard' }).click();

      const response = await page.evaluate(async () => {
        const graphqlResponse = await fetch('/graphql', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              query GetDashboardFilters($dashboardId: UUID!) {
                getDashboardFilters(dashboardId: $dashboardId) {
                  activeFilters {
                    recordFilters {
                      fieldMetadataId
                      operand
                      value
                      type
                      recordFilterGroupId
                      subFieldName
                    }
                    recordFilterGroups {
                      id
                      logicalOperator
                      parentRecordFilterGroupId
                    }
                  }
                  presets {
                    id
                    name
                    visibility
                    position
                    filter {
                      recordFilters {
                        fieldMetadataId
                        operand
                        value
                      }
                      recordFilterGroups {
                        id
                        logicalOperator
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              dashboardId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
            },
          }),
        });

        return graphqlResponse.json();
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.getDashboardFilters.activeFilters.recordFilters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fieldMetadataId: expect.any(String),
            operand: expect.any(String),
          }),
        ]),
      );
      expect(response.data.getDashboardFilters.presets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            visibility: expect.any(String),
          }),
        ]),
      );
    },
  );

  test.skip(
    'updates dashboard filters through the metadata GraphQL API',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Mixed Graph Dashboard' }).click();

      const response = await page.evaluate(async () => {
        const graphqlResponse = await fetch('/graphql', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              mutation UpdateDashboardFilters($input: UpdateDashboardFiltersInput!) {
                updateDashboardFilters(input: $input) {
                  success
                }
              }
            `,
            variables: {
              input: {
                dashboardId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
                activeFilters: {
                  recordFilters: [
                    {
                      fieldMetadataId: '20202020-77d5-4cb6-b60a-f4a835a85d70',
                      operand: 'eq',
                      value: 'open',
                      type: 'TEXT',
                    },
                  ],
                  recordFilterGroups: [],
                },
              },
            },
          }),
        });

        return graphqlResponse.json();
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.updateDashboardFilters.success).toBe(true);
    },
  );
});
