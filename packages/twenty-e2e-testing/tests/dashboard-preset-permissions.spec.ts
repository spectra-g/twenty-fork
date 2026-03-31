// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard preset permissions', () => {
  test.skip(
    'hides preset save and rename affordances for a user without dashboard-edit permission',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Mixed Graph Dashboard' }).click();

      await expect(
        page.getByRole('button', { name: 'Save preset' }),
      ).toBeHidden();
      await expect(
        page.getByRole('button', { name: 'Preset actions' }),
      ).toBeHidden();
    },
  );

  test.skip(
    'returns a permission-denied error when a user without dashboard-edit permission creates a preset',
    async ({ page }) => {
      const response = await page.evaluate(async () => {
        const graphqlResponse = await fetch('/graphql', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
                createDashboardPreset(input: $input) {
                  id
                  name
                }
              }
            `,
            variables: {
              input: {
                pageLayoutId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
                name: 'Team Pipeline',
                visibility: 'WORKSPACE',
                filter: {
                  recordFilters: [],
                  recordFilterGroups: [],
                },
              },
            },
          }),
        });

        return graphqlResponse.json();
      });

      expect(response.data?.createDashboardPreset).toBeNull();
      expect(response.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('permission'),
          }),
        ]),
      );
    },
  );

  test.skip(
    'allows a user with dashboard-edit permission to create a shared preset visible to another workspace member',
    async ({ page, browser }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Mixed Graph Dashboard' }).click();

      const createResponse = await page.evaluate(async () => {
        const graphqlResponse = await fetch('/graphql', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
                createDashboardPreset(input: $input) {
                  id
                  name
                  visibility
                }
              }
            `,
            variables: {
              input: {
                pageLayoutId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
                name: 'Shared Team Pipeline',
                visibility: 'WORKSPACE',
                filter: {
                  recordFilters: [],
                  recordFilterGroups: [],
                },
              },
            },
          }),
        });

        return graphqlResponse.json();
      });

      expect(createResponse.errors).toBeUndefined();
      expect(createResponse.data.createDashboardPreset).toMatchObject({
        id: expect.any(String),
        name: 'Shared Team Pipeline',
        visibility: 'WORKSPACE',
      });

      const secondPage = await browser.newPage();

      await secondPage.goto(page.url());
      await expect(
        secondPage.getByRole('button', { name: 'Shared Team Pipeline' }),
      ).toBeVisible();
      await secondPage.close();
    },
  );

  test.skip(
    'returns an authorization error when a non-creator non-admin renames another user preset',
    async ({ page }) => {
      const response = await page.evaluate(async () => {
        const graphqlResponse = await fetch('/graphql', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              mutation RenameDashboardPreset($id: UUID!, $name: String!) {
                renameDashboardPreset(id: $id, name: $name) {
                  id
                  name
                }
              }
            `,
            variables: {
              id: '20202020-77d5-4cb6-b60a-f4a835a85d99',
              name: 'Renamed By Unauthorized User',
            },
          }),
        });

        return graphqlResponse.json();
      });

      expect(response.data?.renameDashboardPreset).toBeNull();
      expect(response.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('authorized'),
          }),
        ]),
      );
    },
  );
});
