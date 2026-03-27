// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard URL Preset Precedence', () => {
  test.skip(
    'should apply the preset from the dashboard URL and ignore raw filters when both are present',
    async ({ page }) => {
      await page.goto(
        '/dashboards/123?presetId=abc&filter[status][eq]=active',
      );

      await expect(
        page.getByRole('combobox', { name: 'Preset picker' }),
      ).toHaveValue('abc');
      await expect(
        page.getByRole('button', { name: 'Stage Closed Won' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Stage Active' }),
      ).not.toBeVisible();
    },
  );
});
