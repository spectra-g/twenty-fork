// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.skip(
  'encodes dashboard filter state into URL query params when filters are applied',
  async ({ page }) => {
    await page.goto('/dashboards/filter-propagation?view=board');

    await expect(
      page.getByRole('button', { name: 'Add filter' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('button', { name: 'Apply Status is Open' }).click();

    await expect(page.getByText('Status is Open')).toBeVisible();
    await expect(page).toHaveURL(/view=board/);
    await expect(page).toHaveURL(/filter%5Bstatus%5D%5BIS%5D=OPEN/);
  },
);

test.skip(
  'hydrates the dashboard filter bar from encoded URL query params on visit',
  async ({ page }) => {
    await page.goto(
      '/dashboards/filter-propagation?view=board&filter%5Bstatus%5D%5BIS%5D=OPEN',
    );

    await expect(page.getByText('Status is Open')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Clear filters' }),
    ).toBeVisible();
  },
);

test.skip(
  'removes dashboard filter query params when filters are cleared',
  async ({ page }) => {
    await page.goto(
      '/dashboards/filter-propagation?view=board&filter%5Bstatus%5D%5BIS%5D=OPEN',
    );

    await expect(page.getByText('Status is Open')).toBeVisible();

    await page.getByRole('button', { name: 'Clear filters' }).click();

    await expect(page.getByText('No filters applied')).toBeVisible();
    await expect(page).toHaveURL(/view=board/);
    await expect(page).not.toHaveURL(/filter%5Bstatus%5D%5BIS%5D=OPEN/);
  },
);
