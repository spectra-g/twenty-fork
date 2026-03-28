// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe('Dashboard filter presets', () => {
  test.skip('AC-001 saves the current dashboard filters as a named preset and lists it', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /dashboard/i }).click();
    await page.getByRole('button', { name: 'Filters' }).click();

    await page.getByRole('combobox', { name: 'Owner' }).selectOption('owner-1');
    await page.getByRole('textbox', { name: 'Start date' }).fill('2026-03-01');
    await page.getByRole('textbox', { name: 'End date' }).fill('2026-03-31');
    await page
      .getByRole('combobox', { name: 'Stage' })
      .selectOption('QUALIFIED');
    await page.getByRole('button', { name: 'Apply' }).click();

    await page.getByLabel('Preset name').fill('Quarter close owners');
    await page.getByRole('button', { name: 'Save as Preset' }).click();

    await expect(
      page.getByRole('button', { name: 'Apply preset Quarter close owners' }),
    ).toBeVisible();
    await expect(page.getByText('Quarter close owners')).toBeVisible();
  });

  test.skip('AC-002 shows only the current user presets for the same dashboard', async ({
    browser,
  }) => {
    const userAContext = await browser.newContext();
    const userAPage = await userAContext.newPage();

    await userAPage.goto('/');
    await userAPage.getByRole('link', { name: /dashboard/i }).click();
    await userAPage.getByRole('button', { name: 'Filters' }).click();
    await userAPage
      .getByRole('combobox', { name: 'Stage' })
      .selectOption('NEW');
    await userAPage.getByRole('button', { name: 'Apply' }).click();
    await userAPage.getByLabel('Preset name').fill('User A preset');
    await userAPage.getByRole('button', { name: 'Save as Preset' }).click();
    await expect(
      userAPage.getByRole('button', { name: 'Apply preset User A preset' }),
    ).toBeVisible();

    const userBContext = await browser.newContext();
    const userBPage = await userBContext.newPage();

    await userBPage.goto('/');
    await userBPage.getByRole('link', { name: /dashboard/i }).click();
    await userBPage.getByRole('button', { name: 'Filters' }).click();

    await expect(
      userBPage.getByRole('button', { name: 'Apply preset User A preset' }),
    ).not.toBeVisible();

    await userAContext.close();
    await userBContext.close();
  });

  test.skip('AC-003 renames an existing preset from the dashboard filters panel', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /dashboard/i }).click();
    await page.getByRole('button', { name: 'Filters' }).click();

    await page.getByRole('combobox', { name: 'Owner' }).selectOption('owner-2');
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByLabel('Preset name').fill('Initial preset');
    await page.getByRole('button', { name: 'Save as Preset' }).click();

    await page
      .getByRole('button', { name: 'Rename preset Initial preset' })
      .click();
    await page.getByLabel('Rename preset').fill('Renamed preset');
    await page.getByRole('button', { name: 'Confirm rename' }).click();

    await expect(page.getByText('Renamed preset')).toBeVisible();
    await expect(page.getByText('Initial preset')).not.toBeVisible();
  });

  test.skip('AC-004 reapplies a saved preset and refreshes widgets with the saved filters', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /dashboard/i }).click();
    await page.getByRole('button', { name: 'Filters' }).click();

    const widgetRefreshRequestPromise = page.waitForRequest((request) => {
      if (!request.url().endsWith('/graphql') || request.method() !== 'POST') {
        return false;
      }

      const requestBody = request.postDataJSON();

      return requestBody.operationName === 'BarChartData';
    });

    await page.getByRole('combobox', { name: 'Owner' }).selectOption('owner-1');
    await page.getByRole('textbox', { name: 'Start date' }).fill('2026-01-01');
    await page.getByRole('textbox', { name: 'End date' }).fill('2026-01-31');
    await page
      .getByRole('combobox', { name: 'Stage' })
      .selectOption('NEGOTIATION');
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByLabel('Preset name').fill('January negotiation');
    await page.getByRole('button', { name: 'Save as Preset' }).click();

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.getByRole('combobox', { name: 'Owner' })).toHaveValue('');

    await page
      .getByRole('button', { name: 'Apply preset January negotiation' })
      .click();

    await expect(page.getByRole('combobox', { name: 'Owner' })).toHaveValue(
      'owner-1',
    );
    await expect(page.getByRole('textbox', { name: 'Start date' })).toHaveValue(
      '2026-01-01',
    );
    await expect(page.getByRole('textbox', { name: 'End date' })).toHaveValue(
      '2026-01-31',
    );
    await expect(page.getByRole('combobox', { name: 'Stage' })).toHaveValue(
      'NEGOTIATION',
    );

    const widgetRefreshRequest = await widgetRefreshRequestPromise;
    const widgetRefreshBody = widgetRefreshRequest.postDataJSON();

    await expect(
      widgetRefreshBody.variables.input.configuration.filter.recordFilters,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldMetadataId: 'owner-field-id',
          operand: 'IS',
          value: expect.stringContaining('owner-1'),
        }),
        expect.objectContaining({
          fieldMetadataId: 'close-date-field-id',
          operand: 'GREATER_THAN_OR_EQUAL',
          value: '2026-01-01',
        }),
        expect.objectContaining({
          fieldMetadataId: 'close-date-field-id',
          operand: 'LESS_THAN_OR_EQUAL',
          value: '2026-01-31',
        }),
        expect.objectContaining({
          fieldMetadataId: 'stage-field-id',
          operand: 'IS',
          value: 'NEGOTIATION',
        }),
      ]),
    );
  });
});
