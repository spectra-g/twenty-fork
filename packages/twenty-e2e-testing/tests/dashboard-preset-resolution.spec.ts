// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.skip('dashboard preset resolution', () => {
  test(
    'AC-001 loads dashboard filter state from a preset id in the URL',
    async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Continue with Email' }).click();
      await page.getByLabel('Email').fill('tim@apple.dev');
      await page.getByLabel('Password').fill('Password123!');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await page.goto(
        '/dashboards/filter-propagation?view=board&preset=df68d6fd-c61a-4ef4-b8d4-0c9b2d1b6357',
      );

      await expect(page.getByText('Status is Open')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Clear filters' }),
      ).toBeVisible();

      const firstWidgetCount = page.getByTestId('graph-widget-count').nth(0);
      const secondWidgetCount = page.getByTestId('graph-widget-count').nth(1);

      await expect(firstWidgetCount).toHaveText('5');
      await expect(secondWidgetCount).toHaveText('5');
    },
  );

  test(
    'AC-002 shows the resolved preset name in the dashboard filter bar',
    async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Continue with Email' }).click();
      await page.getByLabel('Email').fill('tim@apple.dev');
      await page.getByLabel('Password').fill('Password123!');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await page.goto(
        '/dashboards/filter-propagation?view=board&preset=df68d6fd-c61a-4ef4-b8d4-0c9b2d1b6357',
      );

      await expect(page.getByText('Open deals')).toBeVisible();
    },
  );

  test(
    'AC-003 unlocks the preset after filter changes and rewrites the URL with raw filter params',
    async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Continue with Email' }).click();
      await page.getByLabel('Email').fill('tim@apple.dev');
      await page.getByLabel('Password').fill('Password123!');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await page.goto(
        '/dashboards/filter-propagation?view=board&preset=df68d6fd-c61a-4ef4-b8d4-0c9b2d1b6357',
      );

      await expect(page.getByText('Open deals')).toBeVisible();

      await page.getByRole('button', { name: 'Clear filters' }).click();

      await expect(page.getByText('No filters applied')).toBeVisible();
      await expect(page.getByText('Open deals')).not.toBeVisible();
      await expect(page).toHaveURL(/view=board/);
      await expect(page).not.toHaveURL(/preset=/);
      await expect(page).not.toHaveURL(/filter%5Bstatus%5D%5BIS%5D=OPEN/);

      await page.getByRole('button', { name: 'Add filter' }).click();
      await page.getByRole('button', { name: 'Apply Status is Open' }).click();

      await expect(page.getByText('Status is Open')).toBeVisible();
      await expect(page).toHaveURL(/filter%5Bstatus%5D%5BIS%5D=OPEN/);
      await expect(page).not.toHaveURL(/preset=/);
    },
  );
});
