// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe('Dashboard graph filters', () => {
  test.skip(
    'applies both global and widget-local filters to graph widget requests',
    async ({ page }) => {
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

      await page.getByRole('combobox', { name: 'Stage' }).selectOption('NEGOTIATION');
      await page.getByRole('button', { name: 'Apply' }).click();
      await page.getByRole('button', { name: 'Edit widget filters' }).click();
      await page.getByRole('button', { name: 'Add filter' }).click();
      await page.getByRole('combobox', { name: 'Field' }).selectOption('Amount');
      await page.getByRole('combobox', { name: 'Operator' }).selectOption('Greater than');
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
    },
  );

  test.skip(
    'uses the global filter value when global and widget-local filters target the same field',
    async ({ page }) => {
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

      await page.getByRole('combobox', { name: 'Owner' }).selectOption('owner-john');
      await page.getByRole('button', { name: 'Apply' }).click();
      await page.getByRole('button', { name: 'Edit widget filters' }).click();
      await page.getByRole('button', { name: 'Add filter' }).click();
      await page.getByRole('combobox', { name: 'Field' }).selectOption('Owner');
      await page.getByRole('combobox', { name: 'Operator' }).selectOption('Is');
      await page.getByRole('combobox', { name: 'Value' }).selectOption('owner-jane');
      await page.getByRole('button', { name: 'Save' }).click();

      const filteredRequest = await filteredWidgetRequestPromise;
      const filteredBody = filteredRequest.postDataJSON();
      const ownerFilters = filteredBody.variables.input.configuration.filter.recordFilters.filter(
        (recordFilter: { fieldMetadataId: string }) =>
          recordFilter.fieldMetadataId === 'owner-field-id',
      );

      await expect(ownerFilters).toEqual([
        expect.objectContaining({
          fieldMetadataId: 'owner-field-id',
          value: expect.stringContaining('owner-john'),
        }),
      ]);
    },
  );
});
