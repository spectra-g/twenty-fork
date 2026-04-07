// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.describe.skip('dashboard URL filter error handling', () => {
  test(
    'AC-001 shows a preset unavailable message and clears filters when the URL references a deleted preset',
    async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Continue with Email' }).click();
      await page.getByLabel('Email').fill('tim@apple.dev');
      await page.getByLabel('Password').fill('Password123!');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await page.goto(
        '/dashboards/filter-propagation?view=board&preset=00000000-0000-0000-0000-000000000404',
      );

      await expect(
        page.getByRole('alert').getByText(
          'This preset is no longer available. The dashboard loaded without it.',
        ),
      ).toBeVisible();
      await expect(page.getByText('No filters applied')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Clear filters' }),
      ).not.toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Add filter' }),
      ).toBeVisible();
    },
  );

  test(
    'AC-002 loads without filters when the URL contains an invalid filter format',
    async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Continue with Email' }).click();
      await page.getByLabel('Email').fill('tim@apple.dev');
      await page.getByLabel('Password').fill('Password123!');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await page.goto(
        '/dashboards/filter-propagation?view=board&filter%5Bstatus%5D=OPEN',
      );

      await expect(page.getByText('No filters applied')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add filter' })).toBeVisible();
      await expect(page.getByRole('alert')).not.toBeVisible();
      await expect(page.getByTestId('graph-widget-count').nth(0)).toBeVisible();
    },
  );

  test(
    'AC-003 falls back to the latest compatible filter format when the URL version is unsupported',
    async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Continue with Email' }).click();
      await page.getByLabel('Email').fill('tim@apple.dev');
      await page.getByLabel('Password').fill('Password123!');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await page.goto(
        '/dashboards/filter-propagation?view=board&filterVersion=999&filter%5Bstatus%5D%5BIS%5D=OPEN',
      );

      await expect(page.getByText('Status is Open')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Clear filters' }),
      ).toBeVisible();
      await expect(page.getByRole('alert')).not.toBeVisible();
      await expect(page.getByTestId('graph-widget-count').nth(0)).toBeVisible();
    },
  );

  test(
    'AC-004 shows a friendly error message for malformed query params and keeps the dashboard usable',
    async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Continue with Email' }).click();
      await page.getByLabel('Email').fill('tim@apple.dev');
      await page.getByLabel('Password').fill('Password123!');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await page.goto(
        '/dashboards/filter-propagation?view=board&filter=%E0%A4%A',
      );

      await expect(
        page.getByRole('alert').getByText(
          'This dashboard link contains invalid filter parameters. The dashboard loaded without them.',
        ),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss dashboard link error' }).click();
      await expect(page.getByRole('alert')).not.toBeVisible();
      await expect(page.getByText('No filters applied')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Add filter' }),
      ).toBeVisible();
    },
  );
});
