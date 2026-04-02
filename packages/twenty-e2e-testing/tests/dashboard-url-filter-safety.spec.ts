// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

const sharedDashboardPath = `${process.env.LINK}/dashboard?filter=status[is]=OPEN&filter=status[is]=PRIVATE&filter=unknownField[is]=IGNORED`;

test.describe('Dashboard URL filter safety', () => {
  test.skip(
    'AC-002: shared dashboard URLs with unavailable filter values load without errors and drop inaccessible values',
    async ({ page }) => {
      const barChartRequests: unknown[] = [];

      page.on('pageerror', (error) => {
        throw error;
      });

      await page.route('**/graphql', async (route) => {
        const request = route.request().postDataJSON();

        if (request.operationName === 'GetBarChartData') {
          barChartRequests.push(request.variables);

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                getBarChartData: [
                  {
                    label: 'Open',
                    value: 5,
                  },
                ],
              },
            }),
          });

          return;
        }

        await route.fallback();
      });

      await page.goto(sharedDashboardPath);

      await expect(page.getByText('Open')).toBeVisible();
      await expect.poll(() => barChartRequests.length).toBeGreaterThan(0);
      expect(JSON.stringify(barChartRequests[0])).toContain('OPEN');
      expect(JSON.stringify(barChartRequests[0])).not.toContain('PRIVATE');
    },
  );

  test.skip(
    'AC-003: malformed or unknown URL filters are skipped while valid filters continue to apply',
    async ({ page }) => {
      const barChartRequests: unknown[] = [];

      await page.route('**/graphql', async (route) => {
        const request = route.request().postDataJSON();

        if (request.operationName === 'GetBarChartData') {
          barChartRequests.push(request.variables);

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                getBarChartData: [
                  {
                    label: 'Open',
                    value: 2,
                  },
                ],
              },
            }),
          });

          return;
        }

        await route.fallback();
      });

      await page.goto(
        `${process.env.LINK}/dashboard?filter=status.badSubField[is]=OPEN&filter=unknownField[is]=IGNORED&filter=status[is]=OPEN`,
      );

      await expect(page.getByText('Open')).toBeVisible();
      await expect.poll(() => barChartRequests.length).toBeGreaterThan(0);
      expect(JSON.stringify(barChartRequests[0])).toContain('OPEN');
      expect(JSON.stringify(barChartRequests[0])).not.toContain('IGNORED');
      expect(JSON.stringify(barChartRequests[0])).not.toContain('badSubField');
    },
  );
});
