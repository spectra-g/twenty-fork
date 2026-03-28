// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe('Dashboard filter permissions', () => {
  test.skip('hides dashboard filter controls for a user without the layouts permission', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /dashboard/i }).click();

    await expect(
      page.getByRole('button', { name: 'Filters' }),
    ).not.toBeVisible();
  });
});
