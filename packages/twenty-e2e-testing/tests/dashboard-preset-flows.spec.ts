// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard Preset Flows', () => {
  test.skip(
    'should save active filters as a named preset from the dashboard filter bar',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Pipeline dashboard' }).click();

      await page.getByRole('combobox', { name: 'Stage filter' }).selectOption({
        label: 'Closed Won',
      });

      await page.getByRole('button', { name: 'Save as Preset' }).click();
      await page.getByRole('textbox', { name: 'Preset name' }).fill('Sales Stage');
      await page.getByRole('button', { name: 'Confirm Save Preset' }).click();

      await expect(
        page.getByRole('combobox', { name: 'Preset picker' }),
      ).toHaveValue('sales-stage');
      await expect(
        page.getByRole('option', { name: 'Sales Stage' }),
      ).toBeVisible();
    },
  );

  test.skip(
    'should restore a preset from presetId in the dashboard URL',
    async ({ page }) => {
      await page.goto('/dashboards/pipeline-dashboard?presetId=sales-stage-preset-123');

      await expect(
        page.getByRole('combobox', { name: 'Preset picker' }),
      ).toHaveValue('sales-stage-preset-123');
      await expect(
        page.getByRole('option', { name: 'Sales View' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Stage Closed Won' }),
      ).toBeVisible();
    },
  );

  test.skip(
    'should rename an existing dashboard preset from the preset picker',
    async ({ page }) => {
      await page.goto('/dashboards/pipeline-dashboard?presetId=sales-stage-preset-123');

      await page.getByRole('combobox', { name: 'Preset picker' }).click();
      await page.getByRole('option', { name: 'Sales View' }).click();
      await page.getByRole('button', { name: 'Rename Preset' }).click();
      await page.getByRole('textbox', { name: 'Preset name' }).fill('Q1 Sales');
      await page.getByRole('button', { name: 'Confirm Rename Preset' }).click();

      await expect(
        page.getByRole('combobox', { name: 'Preset picker' }),
      ).toHaveValue('sales-stage-preset-123');
      await expect(
        page.getByRole('option', { name: 'Q1 Sales' }),
      ).toBeVisible();
    },
  );

  test.skip(
    'should restore raw stage filters from the dashboard URL when no preset is selected',
    async ({ page }) => {
      await page.goto('/dashboards/pipeline-dashboard?filter[stage][eq]=Open');

      await expect(
        page.getByRole('combobox', { name: 'Preset picker' }),
      ).toHaveValue('');
      await expect(
        page.getByRole('combobox', { name: 'Stage filter' }),
      ).toHaveValue('open');
      await expect(
        page.getByRole('button', { name: 'Stage Open' }),
      ).toBeVisible();
    },
  );
});
