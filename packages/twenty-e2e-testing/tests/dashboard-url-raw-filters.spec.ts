// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.serial('Dashboard URL Raw Filters', () => {
  test.skip(
    'should restore explicit raw filters from the dashboard URL when no preset is present',
    async ({ page }) => {
      await page.goto(
        '/dashboards/123?filter[status][eq]=active&filter[owner][eq]=me',
      );

      await expect(
        page.getByRole('combobox', { name: 'Preset picker' }),
      ).toHaveValue('');
      await expect(
        page.getByRole('button', { name: 'Status Active' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Owner Me' }),
      ).toBeVisible();
    },
  );
});
