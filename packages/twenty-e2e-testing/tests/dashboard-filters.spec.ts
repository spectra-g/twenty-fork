// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe('Dashboard graph filters', () => {
  test.skip('serializes applied dashboard filters into the shareable dashboard URL and restores them in a new tab', async ({
    page,
    context,
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

    await expect(page).toHaveURL(
      /filter%5Bowner\.workspaceMemberId%5D%5BIS%5D=.*filter%5BcloseDate%5D%5BGREATER_THAN_OR_EQUAL%5D=2026-03-01.*filter%5BcloseDate%5D%5BLESS_THAN_OR_EQUAL%5D=2026-03-31.*filter%5Bstage%5D%5BIS%5D=QUALIFIED/,
    );

    const sharedUrl = page.url();
    const reopenedPage = await context.newPage();

    const graphRequestPromise = reopenedPage.waitForRequest((request) => {
      if (!request.url().endsWith('/graphql') || request.method() !== 'POST') {
        return false;
      }

      const requestBody = request.postDataJSON();

      return requestBody.operationName === 'BarChartData';
    });

    await reopenedPage.goto(sharedUrl);
    await reopenedPage.getByRole('button', { name: 'Filters' }).click();

    await expect(
      reopenedPage.getByRole('combobox', { name: 'Owner' }),
    ).toHaveValue('owner-1');
    await expect(
      reopenedPage.getByRole('textbox', { name: 'Start date' }),
    ).toHaveValue('2026-03-01');
    await expect(
      reopenedPage.getByRole('textbox', { name: 'End date' }),
    ).toHaveValue('2026-03-31');
    await expect(
      reopenedPage.getByRole('combobox', { name: 'Stage' }),
    ).toHaveValue('QUALIFIED');

    const graphRequest = await graphRequestPromise;
    const graphRequestBody = graphRequest.postDataJSON();

    await expect(
      graphRequestBody.variables.input.configuration.filter.recordFilters,
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
          value: '2026-03-01',
        }),
        expect.objectContaining({
          fieldMetadataId: 'close-date-field-id',
          operand: 'LESS_THAN_OR_EQUAL',
          value: '2026-03-31',
        }),
        expect.objectContaining({
          fieldMetadataId: 'stage-field-id',
          operand: 'IS',
          value: 'QUALIFIED',
        }),
      ]),
    );
  });

  test.skip('hydrates dashboard filters from URL query params and requests widget data with the hydrated filters', async ({
    page,
  }) => {
    await page.goto(
      '/dashboard?filter%5Bowner.workspaceMemberId%5D%5BIS%5D=%7B%22isCurrentWorkspaceMemberSelected%22%3Afalse%2C%22selectedRecordIds%22%3A%5B%22owner-2%22%5D%7D&filter%5BcloseDate%5D%5BGREATER_THAN_OR_EQUAL%5D=2026-02-01&filter%5BcloseDate%5D%5BLESS_THAN_OR_EQUAL%5D=2026-02-28&filter%5Bstage%5D%5BIS%5D=NEW',
    );

    const graphRequestPromise = page.waitForRequest((request) => {
      if (!request.url().endsWith('/graphql') || request.method() !== 'POST') {
        return false;
      }

      const requestBody = request.postDataJSON();

      return requestBody.operationName === 'LineChartData';
    });

    await page.getByRole('button', { name: 'Filters' }).click();

    await expect(page.getByRole('combobox', { name: 'Owner' })).toHaveValue(
      'owner-2',
    );
    await expect(page.getByRole('textbox', { name: 'Start date' })).toHaveValue(
      '2026-02-01',
    );
    await expect(page.getByRole('textbox', { name: 'End date' })).toHaveValue(
      '2026-02-28',
    );
    await expect(page.getByRole('combobox', { name: 'Stage' })).toHaveValue(
      'NEW',
    );

    const graphRequest = await graphRequestPromise;
    const graphRequestBody = graphRequest.postDataJSON();

    await expect(
      graphRequestBody.variables.input.configuration.filter.recordFilters,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldMetadataId: 'owner-field-id',
          operand: 'IS',
          value: expect.stringContaining('owner-2'),
        }),
        expect.objectContaining({
          fieldMetadataId: 'close-date-field-id',
          operand: 'GREATER_THAN_OR_EQUAL',
          value: '2026-02-01',
        }),
        expect.objectContaining({
          fieldMetadataId: 'close-date-field-id',
          operand: 'LESS_THAN_OR_EQUAL',
          value: '2026-02-28',
        }),
        expect.objectContaining({
          fieldMetadataId: 'stage-field-id',
          operand: 'IS',
          value: 'NEW',
        }),
      ]),
    );
  });

  test.skip('applies both global and widget-local filters to graph widget requests', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /dashboard/i }).click();
    await page.getByRole('button', { name: 'Filters' }).click();

    const filteredWidgetRequestPromise = page.waitForRequest((request) => {
      if (!request.url().endsWith('/graphql') || request.method() !== 'POST') {
        return false;
      }

      const requestBody = request.postDataJSON();

      return requestBody.operationName === 'BarChartData';
    });

    await page
      .getByRole('combobox', { name: 'Stage' })
      .selectOption('NEGOTIATION');
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Edit widget filters' }).click();
    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('combobox', { name: 'Field' }).selectOption('Amount');
    await page
      .getByRole('combobox', { name: 'Operator' })
      .selectOption('Greater than');
    await page.getByRole('textbox', { name: 'Value' }).fill('10000');
    await page.getByRole('button', { name: 'Save' }).click();

    const filteredRequest = await filteredWidgetRequestPromise;
    const filteredBody = filteredRequest.postDataJSON();
    const filter = filteredBody.variables.input.configuration.filter;

    await expect(filter.recordFilters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldMetadataId: 'stage-field-id',
          operand: 'IS',
          value: 'NEGOTIATION',
        }),
        expect.objectContaining({
          fieldMetadataId: 'amount-field-id',
          operand: 'GREATER_THAN',
          value: '10000',
        }),
      ]),
    );
  });

  test.skip('uses the global filter value when global and widget-local filters target the same field', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /dashboard/i }).click();
    await page.getByRole('button', { name: 'Filters' }).click();

    const filteredWidgetRequestPromise = page.waitForRequest((request) => {
      if (!request.url().endsWith('/graphql') || request.method() !== 'POST') {
        return false;
      }

      const requestBody = request.postDataJSON();

      return requestBody.operationName === 'PieChartData';
    });

    await page
      .getByRole('combobox', { name: 'Owner' })
      .selectOption('owner-john');
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Edit widget filters' }).click();
    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('combobox', { name: 'Field' }).selectOption('Owner');
    await page.getByRole('combobox', { name: 'Operator' }).selectOption('Is');
    await page
      .getByRole('combobox', { name: 'Value' })
      .selectOption('owner-jane');
    await page.getByRole('button', { name: 'Save' }).click();

    const filteredRequest = await filteredWidgetRequestPromise;
    const filteredBody = filteredRequest.postDataJSON();
    const ownerFilters =
      filteredBody.variables.input.configuration.filter.recordFilters.filter(
        (recordFilter: { fieldMetadataId: string }) =>
          recordFilter.fieldMetadataId === 'owner-field-id',
      );

    await expect(ownerFilters).toEqual([
      expect.objectContaining({
        fieldMetadataId: 'owner-field-id',
        value: expect.stringContaining('owner-john'),
      }),
    ]);
  });
});
