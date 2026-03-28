// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '../lib/fixtures/screenshot';

test.skip('AC-001: user saves current dashboard filters as a named preset and sees it in the picker list', async ({
  page,
}) => {
  await page.goto('/dashboard');

  await page.getByRole('button', { name: 'Add filter' }).click();
  await page.getByLabel('Value').fill('Apple');
  await page.getByRole('button', { name: 'Apply filter' }).click();

  await page.getByRole('button', { name: 'Filter presets' }).click();
  await page.getByRole('button', { name: 'Save as preset' }).click();
  await page.getByLabel('Preset name').fill('Q1 Sales');
  await page.getByRole('button', { name: 'Save preset' }).click();

  await expect(
    page.getByRole('button', { name: 'Filter presets' }),
  ).toContainText('Q1 Sales');

  await page.getByRole('button', { name: 'Filter presets' }).click();

  await expect(
    page.getByRole('button', { name: 'Apply preset Q1 Sales' }),
  ).toBeVisible();
});

test.skip('AC-002: user reapplies a saved preset and widgets refresh to the preset filter state', async ({
  page,
}) => {
  await page.goto('/dashboard');

  await page.getByRole('button', { name: 'Add filter' }).click();
  await page.getByLabel('Value').fill('Apple');
  await page.getByRole('button', { name: 'Apply filter' }).click();

  await page.getByRole('button', { name: 'Filter presets' }).click();
  await page.getByRole('button', { name: 'Save as preset' }).click();
  await page.getByLabel('Preset name').fill('Q1 Sales');
  await page.getByRole('button', { name: 'Save preset' }).click();

  await page.getByRole('button', { name: 'Add filter' }).click();
  await page.getByLabel('Value').fill('Other');
  await page.getByRole('button', { name: 'Apply filter' }).click();
  await expect(
    page.getByRole('button', { name: /Name contains Other/i }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Filter presets' }).click();
  await page.getByRole('button', { name: 'Apply preset Q1 Sales' }).click();

  await expect(
    page.getByRole('button', { name: /Name contains Apple/i }),
  ).toBeVisible();
  await expect(page.getByText('Apple')).toBeVisible();
  await expect(page.getByText('Other')).not.toBeVisible();
});

test.skip('AC-003: user cannot save a preset with an empty name', async ({
  page,
}) => {
  await page.goto('/dashboard');

  await page.getByRole('button', { name: 'Filter presets' }).click();
  await page.getByRole('button', { name: 'Save as preset' }).click();

  await expect(page.getByLabel('Preset name')).toHaveValue('');
  await expect(page.getByText('Preset name is required')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Save preset' }),
  ).toBeDisabled();
});
