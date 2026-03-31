// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '@playwright/test';

test.describe('dashboard filter applicability', () => {
  test.skip(
    'AC-001: graph widget applies a compatible owner filter',
    async ({ page }) => {
      await page.goto('/dashboard');

      await page.getByRole('button', { name: 'Add widget' }).click();
      await page.getByRole('menuitem', { name: 'Graph' }).click();

      await page.getByTestId('owner-filter-dropdown').selectOption({
        label: 'Alice Anderson',
      });

      await expect(page.getByTestId('widget-refreshing').first()).toHaveText(
        '1',
      );
      await expect(
        page.getByRole('heading', { name: /Alice Anderson/i }),
      ).toBeVisible();
    },
  );

  test.skip(
    'AC-002: non-graph widgets ignore unsupported owner filters',
    async ({ page }) => {
      await page.goto('/dashboard');

      await page.getByRole('button', { name: 'Add widget' }).click();
      await page.getByRole('menuitem', { name: 'Notes' }).click();

      const notesWidget = page.getByTestId('notes-widget').first();
      const beforeText = await notesWidget.textContent();

      await page.getByTestId('owner-filter-dropdown').selectOption({
        label: 'Alice Anderson',
      });

      await expect(notesWidget).toHaveText(beforeText ?? '');
    },
  );

  test.skip(
    'AC-003: graph widgets merge local and dashboard filters',
    async ({ page }) => {
      await page.goto('/dashboard');

      await page.getByRole('button', { name: 'Add widget' }).click();
      await page.getByRole('menuitem', { name: 'Graph' }).click();
      await page.getByRole('button', { name: 'Edit widget' }).click();
      await page.getByRole('button', { name: 'Add filter' }).click();
      await page.getByLabel('Field').selectOption({ label: 'Stage' });
      await page.getByLabel('Value').selectOption({ label: 'Proposal' });
      await page.getByRole('button', { name: 'Save' }).click();

      await page.getByTestId('owner-filter-dropdown').selectOption({
        label: 'Alice Anderson',
      });

      await expect(page.getByTestId('widget-refreshing').first()).toHaveText(
        '1',
      );
      await expect(
        page.getByRole('heading', {
          name: /Alice Anderson.*Proposal|Proposal.*Alice Anderson/i,
        }),
      ).toBeVisible();
    },
  );
});
