// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard URL Shared Preset', () => {
  test.skip(
    'should resolve and apply a shared preset from the dashboard URL for another user',
    async ({ page }) => {
      await page.goto('/dashboards/123?presetId=shared');

      await expect(
        page.getByRole('combobox', { name: 'Preset picker' }),
      ).toHaveValue('shared');
      await expect(
        page.getByRole('option', { name: 'Shared Pipeline' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Stage Closed Won' }),
      ).toBeVisible();
    },
  );
});
