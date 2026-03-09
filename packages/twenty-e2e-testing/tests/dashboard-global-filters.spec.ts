import { expect, test } from '../lib/fixtures/screenshot';

const dashboardPath = '/dashboard';

test.describe.serial('Dashboard global filters', () => {
  test('AC-001: global filters override local widget filters', async ({ page }) => {
    await page.goto(dashboardPath);

    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('combobox', { name: 'Field' }).click();
    await page.getByRole('option', { name: 'Stage' }).click();
    await page.getByRole('combobox', { name: 'Value' }).click();
    await page.getByRole('option', { name: 'Closed Won' }).click();

    const [chartRequest] = await Promise.all([
      page.waitForRequest((request) => {
        if (!request.url().endsWith('/graphql')) {
          return false;
        }

        const body = request.postDataJSON();

        return body?.operationName === 'BarChartData';
      }),
      page.getByRole('button', { name: 'Apply' }).click(),
    ]);

    const requestBody = chartRequest.postDataJSON();

    expect(
      JSON.stringify(requestBody?.variables?.input?.configuration?.filter ?? {}),
    ).toContain('Closed Won');
  });

  test('AC-002: local widget filters still work without global filters', async ({
    page,
  }) => {
    await page.goto(dashboardPath);

    await expect(page.getByTestId('graph-widget')).toBeVisible();

    const chartRequest = await page.waitForRequest((request) => {
      if (!request.url().endsWith('/graphql')) {
        return false;
      }

      const body = request.postDataJSON();

      return body?.operationName === 'LineChartData';
    });

    const requestBody = chartRequest.postDataJSON();

    expect(requestBody?.variables?.input?.configuration?.filter).toBeDefined();
  });

  test('AC-003: URL sync writes encoded global filters under 2048 chars', async ({
    page,
  }) => {
    await page.goto(dashboardPath);

    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();

    await expect
      .poll(() => page.url())
      .toContain('dashboardFilters=');

    const currentUrl = page.url();
    expect(currentUrl.length).toBeLessThanOrEqual(2048);
  });

  test('AC-004: URL hydration restores toolbar and widget filter state', async ({
    page,
  }) => {
    const encodedFilter = encodeURIComponent(
      JSON.stringify({
        recordFilters: [
          {
            id: 'global-filter-1',
            fieldMetadataId: 'field-stage',
            value: 'Closed Won',
            displayValue: 'Closed Won',
            type: 'SELECT',
            operand: 'IS',
            label: 'Stage',
          },
        ],
        recordFilterGroups: [],
      }),
    );

    await page.goto(`${dashboardPath}?dashboardFilters=${encodedFilter}`);

    await expect(page.getByRole('button', { name: /Stage/i })).toBeVisible();

    const chartRequest = await page.waitForRequest((request) => {
      if (!request.url().endsWith('/graphql')) {
        return false;
      }

      const body = request.postDataJSON();

      return body?.operationName === 'PieChartData';
    });

    const requestBody = chartRequest.postDataJSON();

    expect(
      JSON.stringify(requestBody?.variables?.input?.configuration?.filter ?? {}),
    ).toContain('Closed Won');
  });
});
