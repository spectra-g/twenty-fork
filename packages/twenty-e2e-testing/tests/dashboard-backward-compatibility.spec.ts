// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe('Dashboard backward compatibility', () => {
  test.skip('renders a dashboard whose page layout payload omits global filter state', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /dashboard/i }).click();

    await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible();
  });
});
