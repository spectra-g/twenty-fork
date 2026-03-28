// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe('Dashboard filter panel', () => {
  test.skip(
    'opens the panel with empty Owner, Date Range, and Stage controls',
    async ({ page }) => {
      await page.goto('/');
      await page.getByRole('link', { name: /dashboard/i }).click();
      await page.getByRole('button', { name: 'Filters' }).click();

      await expect(
        page.getByRole('combobox', { name: 'Owner' }),
      ).toHaveValue('');
      await expect(page.getByLabel('Start date')).toHaveValue('');
      await expect(page.getByLabel('End date')).toHaveValue('');
      await expect(
        page.getByRole('combobox', { name: 'Stage' }),
      ).toHaveValue('');
    },
  );

  test.skip(
    'applies filters to widget refresh requests and clears them again',
    async ({ page }) => {
      await page.goto('/');
      await page.getByRole('link', { name: /dashboard/i }).click();
      await page.getByRole('button', { name: 'Filters' }).click();

      const filteredWidgetRequestPromise = page.waitForRequest((request) => {
        if (!request.url().endsWith('/graphql') || request.method() !== 'POST') {
          return false;
        }

        const requestBody = request.postDataJSON();

        return (
          requestBody.operationName === 'BarChartData' ||
          requestBody.operationName === 'LineChartData' ||
          requestBody.operationName === 'PieChartData'
        );
      });

      await page.getByRole('combobox', { name: 'Owner' }).selectOption('owner-1');
      await page.getByLabel('Start date').fill('2026-01-01');
      await page.getByLabel('End date').fill('2026-01-31');
      await page.getByRole('combobox', { name: 'Stage' }).selectOption('NEW');
      await page.getByRole('button', { name: 'Apply' }).click();

      const filteredRequest = await filteredWidgetRequestPromise;
      const filteredBody = filteredRequest.postDataJSON();
      const filteredConfiguration =
        filteredBody.variables.input.configuration.filter;

      await expect(filteredConfiguration.recordFilters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            operand: 'IS',
            subFieldName: 'workspaceMemberId',
          }),
          expect.objectContaining({
            operand: 'GREATER_THAN_OR_EQUAL',
          }),
          expect.objectContaining({
            operand: 'LESS_THAN_OR_EQUAL',
          }),
          expect.objectContaining({
            operand: 'IS',
            value: 'NEW',
          }),
        ]),
      );

      const clearedWidgetRequestPromise = page.waitForRequest((request) => {
        if (!request.url().endsWith('/graphql') || request.method() !== 'POST') {
          return false;
        }

        const requestBody = request.postDataJSON();

        return (
          requestBody.operationName === 'BarChartData' ||
          requestBody.operationName === 'LineChartData' ||
          requestBody.operationName === 'PieChartData'
        );
      });

      await page.getByRole('button', { name: 'Clear filters' }).click();

      await expect(
        page.getByRole('combobox', { name: 'Owner' }),
      ).toHaveValue('');
      await expect(page.getByLabel('Start date')).toHaveValue('');
      await expect(page.getByLabel('End date')).toHaveValue('');
      await expect(
        page.getByRole('combobox', { name: 'Stage' }),
      ).toHaveValue('');

      const clearedRequest = await clearedWidgetRequestPromise;
      const clearedBody = clearedRequest.postDataJSON();

      await expect(
        clearedBody.variables.input.configuration.filter,
      ).toBeUndefined();
    },
  );
});
