// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.skip(
  'widget with local filters applies the intersection of local and dashboard filters',
  async ({ page }) => {
    await page.goto('/dashboards/filter-merge');

    await expect(
      page.getByRole('button', { name: 'Add filter' }),
    ).toBeVisible();

    await expect(
      page.getByTestId('graph-widget-count').getByText('Active owned by Alice'),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('button', { name: 'Apply Owner is Alice' }).click();

    await expect(page.getByText('Owner is Alice')).toBeVisible();
    await expect(
      page.getByTestId('graph-widget-count').getByText('Active owned by Alice'),
    ).toBeVisible();
  },
);

test.skip(
  'widget without local filters uses only the dashboard filter',
  async ({ page }) => {
    await page.goto('/dashboards/filter-merge');

    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('button', { name: 'Apply Owner is Alice' }).click();

    await expect(
      page.getByTestId('graph-widget-count').getByText('Owned by Alice'),
    ).toBeVisible();
  },
);

test.skip(
  'clearing dashboard filters leaves widget-local filters unchanged',
  async ({ page }) => {
    await page.goto('/dashboards/filter-merge');

    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByRole('button', { name: 'Apply Owner is Alice' }).click();
    await page.getByRole('button', { name: 'Clear filters' }).click();

    await expect(page.getByText('No filters applied')).toBeVisible();
    await expect(
      page.getByTestId('graph-widget-count').getByText('Active contacts'),
    ).toBeVisible();
  },
);
