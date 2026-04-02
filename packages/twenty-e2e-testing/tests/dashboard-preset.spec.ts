// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

const dashboardPath = `${process.env.LINK}/dashboard`;

test.describe('Dashboard presets', () => {
  test.skip(
    'AC-001: user can save current filters as a named preset',
    async ({ page }) => {
      await page.goto(dashboardPath);

      await page.getByTestId('dashboard-filter-toggle').click();
      await page.getByRole('button', { name: 'Presets' }).click();
      await page.getByRole('button', { name: 'Save Preset' }).click();
      await page.getByRole('textbox', { name: 'Preset name' }).fill('My Preset');
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(
        page.getByRole('button', { name: 'My Preset' }),
      ).toBeVisible();
    },
  );

  test.skip(
    'AC-002: user can apply a saved preset to update dashboard filters',
    async ({ page }) => {
      await page.goto(dashboardPath);

      await page.getByTestId('dashboard-filter-toggle').click();
      await page.getByRole('button', { name: 'Presets' }).click();
      await page.getByRole('button', { name: 'Save Preset' }).click();
      await page
        .getByRole('textbox', { name: 'Preset name' })
        .fill('Open Focus');
      await page.getByRole('button', { name: 'Save' }).click();

      await page.getByTestId('remove-icon-dashboard-global-filter').click();
      await page.getByRole('button', { name: 'Presets' }).click();
      await page.getByRole('button', { name: 'Open Focus' }).click();

      await expect(page.getByText('Open')).toBeVisible();
      await expect(page.getByTestId('dashboard-filter-toggle')).toHaveCount(0);
    },
  );

  test.skip(
    'AC-003: user can save a preset with empty filter state',
    async ({ page }) => {
      await page.goto(dashboardPath);

      await page.getByRole('button', { name: 'Presets' }).click();
      await page.getByRole('button', { name: 'Save Preset' }).click();
      await page
        .getByRole('textbox', { name: 'Preset name' })
        .fill('Empty Preset');
      await page.getByRole('button', { name: 'Save' }).click();
      await page.getByTestId('dashboard-filter-toggle').click();
      await page.getByRole('button', { name: 'Presets' }).click();
      await page.getByRole('button', { name: 'Empty Preset' }).click();

      await expect(page.getByTestId('dashboard-filter-toggle')).toBeVisible();
      await expect(page.getByTestId('dashboard-global-filter')).toHaveCount(0);
    },
  );
});
