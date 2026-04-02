// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

const dashboardPath = `${process.env.LINK}/dashboard`;

test.describe('Dashboard preset rename and delete', () => {
  test.skip(
    'AC-001: user renames a preset from the preset dropdown',
    async ({ page }) => {
      await page.goto(dashboardPath);

      await page.getByRole('button', { name: 'Presets' }).click();
      await page
        .getByRole('button', { name: 'Rename preset Q4 Focus' })
        .click();
      await page
        .getByRole('textbox', { name: 'Rename preset' })
        .fill('Q4 Pipeline Review');
      await page.getByRole('button', { name: 'Rename' }).click();

      await expect(
        page.getByRole('button', { name: 'Q4 Pipeline Review' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Q4 Focus' }),
      ).toHaveCount(0);
    },
  );

  test.skip(
    'AC-002: user confirms preset deletion and the preset disappears',
    async ({ page }) => {
      await page.goto(dashboardPath);

      await page.getByRole('button', { name: 'Presets' }).click();
      await page
        .getByRole('button', { name: 'Delete preset Q4 Focus' })
        .click();
      await expect(
        page.getByRole('dialog', { name: 'Delete preset' }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Delete' }).click();

      await expect(
        page.getByRole('button', { name: 'Q4 Focus' }),
      ).toHaveCount(0);
    },
  );

  test.skip(
    'AC-003: user cancels preset deletion and the preset remains unchanged',
    async ({ page }) => {
      await page.goto(dashboardPath);

      await page.getByRole('button', { name: 'Presets' }).click();
      await page
        .getByRole('button', { name: 'Delete preset Q4 Focus' })
        .click();
      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect(
        page.getByRole('dialog', { name: 'Delete preset' }),
      ).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'Q4 Focus' }),
      ).toBeVisible();
    },
  );
});
