// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.skip(
  'AC-001: dashboard viewer applies a global text filter and widgets refresh with filtered data',
  async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByRole('button', { name: 'Add filter' }),
    ).toBeVisible();
    await expect(page.getByText('All companies')).toBeVisible();

    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByLabel('Field').selectOption({ label: 'Name' });
    await page.getByLabel('Value').fill('Apple');
    await page.getByRole('button', { name: 'Apply filter' }).click();

    await expect(page.getByRole('button', { name: /Name contains Apple/i }))
      .toBeVisible();
    await expect(page.getByText('Apple')).toBeVisible();
    await expect(page.getByText('All companies')).not.toBeVisible();
  },
);

test.skip(
  'AC-002: dashboard view mode shows a filter bar above the tab content with an Add filter trigger',
  async ({ page }) => {
    await page.goto('/dashboard');

    const filterBar = page.getByTestId('dashboard-filter-bar');
    await expect(filterBar).toBeVisible();
    await expect(
      filterBar.getByRole('button', { name: 'Add filter' }),
    ).toBeVisible();
    await expect(filterBar).toBeVisible();
    await expect(page.getByTestId('page-layout-main-content')).toBeVisible();
  },
);

test.skip(
  'AC-003: clicking a filter chip reopens editable criteria in the dashboard filter bar',
  async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Add filter' }).click();
    await page.getByLabel('Field').selectOption({ label: 'Name' });
    await page.getByLabel('Value').fill('Apple');
    await page.getByRole('button', { name: 'Apply filter' }).click();

    const filterChip = page.getByRole('button', {
      name: /Name contains Apple/i,
    });

    await expect(filterChip).toBeVisible();
    await filterChip.click();

    await expect(page.getByLabel('Field')).toHaveValue('name');
    await expect(page.getByLabel('Value')).toHaveValue('Apple');
    await expect(page.getByRole('button', { name: 'Apply filter' }))
      .toBeVisible();
  },
);
