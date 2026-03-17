// E2E: requires live stack — un-skip in CI or local dev with servers running.
import { expect, test } from '../lib/fixtures/screenshot';

test.skip('warns before creating a duplicate company when the name matches', async ({
  page,
}) => {
  await page.goto('/companies');

  await page.getByRole('button', { name: 'Create new record' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill('Acme Corp');

  await expect(
    page.getByRole('heading', { name: 'Potential duplicate companies' }),
  ).toBeVisible();
  await expect(page.getByText('Acme Corp')).toBeVisible();
});

test.skip('warns before creating a duplicate company when the domain matches', async ({
  page,
}) => {
  await page.goto('/companies');

  await page.getByRole('button', { name: 'Create new record' }).click();
  await page.getByRole('textbox', { name: 'Domain' }).fill('acme.com');

  await expect(
    page.getByRole('heading', { name: 'Potential duplicate companies' }),
  ).toBeVisible();
  await expect(page.getByText('Acme Corp')).toBeVisible();
});

test.skip('closes the warning dialog and does not create a company when cancel is clicked', async ({
  page,
}) => {
  await page.goto('/companies');

  await page.getByRole('button', { name: 'Create new record' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill('Acme Corp');
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(
    page.getByRole('heading', { name: 'Potential duplicate companies' }),
  ).not.toBeVisible();
});

test.skip('creates the company after the user confirms create anyway', async ({
  page,
}) => {
  await page.goto('/companies');

  await page.getByRole('button', { name: 'Create new record' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill('Acme Corp');
  await page.getByRole('button', { name: 'Create anyway' }).click();

  await expect(page.getByText('Acme Corp')).toBeVisible();
});

test.skip('shows the warning again on a later duplicate create attempt after create anyway', async ({
  page,
}) => {
  await page.goto('/companies');

  await page.getByRole('button', { name: 'Create new record' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill('Acme Corp');
  await page.getByRole('button', { name: 'Create anyway' }).click();

  await page.getByRole('button', { name: 'Create new record' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill('Acme Corp');

  await expect(
    page.getByRole('heading', { name: 'Potential duplicate companies' }),
  ).toBeVisible();
});
