// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard Preset Uniqueness', () => {
  test.skip(
    'should reject creating two presets with the same name on one dashboard',
    async ({ page }) => {
      await page.getByRole('link', { name: 'Dashboards' }).click();
      await page.getByRole('link', { name: 'Pipeline dashboard' }).click();

      await page.getByRole('combobox', { name: 'Stage filter' }).selectOption({
        label: 'Closed Won',
      });

      await page.getByRole('button', { name: 'Save as Preset' }).click();
      await page.getByRole('textbox', { name: 'Preset name' }).fill('Sales');
      await page.getByRole('button', { name: 'Confirm Save Preset' }).click();

      await expect(
        page.getByRole('option', { name: 'Sales' }),
      ).toBeVisible();

      await page.getByRole('combobox', { name: 'Stage filter' }).selectOption({
        label: 'Open',
      });
      await page.getByRole('button', { name: 'Save as Preset' }).click();
      await page.getByRole('textbox', { name: 'Preset name' }).fill('Sales');
      await page.getByRole('button', { name: 'Confirm Save Preset' }).click();

      await expect(
        page.getByText('A dashboard preset with this name already exists.'),
      ).toBeVisible();
      await expect(
        page.getByRole('option', { name: 'Sales' }),
      ).toHaveCount(1);
    },
  );
});
