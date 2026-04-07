// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.skip(
  'newly added graph widgets respect the active dashboard filter immediately',
  async ({ page }) => {
    await page.goto('/dashboards/filter-propagation');

    await expect(
      page.getByRole('button', { name: 'Add filter' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('button', { name: 'Apply Status is Open' }).click();

    await expect(page.getByText('Status is Open')).toBeVisible();

    await page.getByRole('button', { name: 'Add widget' }).click();
    await page.getByRole('menuitem', { name: 'Bar chart' }).click();

    const newestWidgetCount = page.getByTestId('graph-widget-count').last();

    await expect(newestWidgetCount).toHaveText('5');
  },
);

test.skip(
  'dashboard widget filters persist across page reloads',
  async ({ page }) => {
    await page.goto('/dashboards/filter-propagation');

    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('button', { name: 'Apply Status is Open' }).click();

    await expect(page.getByText('Status is Open')).toBeVisible();
    await expect(
      page.getByTestId('graph-widget-count').first(),
    ).toHaveText('5');

    await page.reload();

    await expect(page.getByText('Status is Open')).toBeVisible();
    await expect(
      page.getByTestId('graph-widget-count').first(),
    ).toHaveText('5');
  },
);
