// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.skip(
  'dashboard filter applies to multiple widgets',
  async ({ page }) => {
    await page.getByRole('link', { name: 'Dashboards' }).click();
    await page.getByRole('button', { name: 'Create dashboard' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill('Filter Propagation');
    await page.getByRole('button', { name: 'Create' }).click();

    await page.getByRole('button', { name: 'Add widget' }).click();
    await page.getByRole('menuitem', { name: 'Bar chart' }).click();
    await page.getByRole('button', { name: 'Add widget' }).click();
    await page.getByRole('menuitem', { name: 'Bar chart' }).click();

    await expect(
      page.getByRole('button', { name: 'Add filter' }),
    ).toBeVisible();

    const firstWidgetCount = page.getByTestId('graph-widget-count').nth(0);
    const secondWidgetCount = page.getByTestId('graph-widget-count').nth(1);

    await expect(firstWidgetCount).toHaveText('12');
    await expect(secondWidgetCount).toHaveText('12');

    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('button', { name: 'Apply Status is Open' }).click();

    await expect(page.getByText('Status is Open')).toBeVisible();
    await expect(firstWidgetCount).toHaveText('5');
    await expect(secondWidgetCount).toHaveText('5');
  },
);

test.skip(
  'clearing the dashboard filter reverts widget data',
  async ({ page }) => {
    await page.goto('/dashboards/filter-propagation');

    const firstWidgetCount = page.getByTestId('graph-widget-count').nth(0);
    const secondWidgetCount = page.getByTestId('graph-widget-count').nth(1);

    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('button', { name: 'Apply Status is Open' }).click();

    await expect(firstWidgetCount).toHaveText('5');
    await expect(secondWidgetCount).toHaveText('5');

    await page.getByRole('button', { name: 'Clear filters' }).click();

    await expect(page.getByText('No filters applied')).toBeVisible();
    await expect(firstWidgetCount).toHaveText('12');
    await expect(secondWidgetCount).toHaveText('12');
  },
);

test.skip(
  'dashboard filter bar shows an empty state when no filters are applied',
  async ({ page }) => {
    await page.goto('/dashboards/filter-propagation');

    await expect(page.getByText('No filters applied')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Add filter' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Clear filters' }),
    ).toBeHidden();
  },
);
