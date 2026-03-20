// E2E: requires live stack — un-skip in CI or local dev with servers running.
import { expect, test } from '../lib/fixtures/screenshot';
import { AccountsSection } from '../lib/pom/settings/accountsSection';
import { SettingsPage } from '../lib/pom/settingsPage';

test.describe('Settings accounts blocklist', () => {
  let accountsSection: AccountsSection;
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    accountsSection = new AccountsSection(page);
    settingsPage = new SettingsPage(page);

    await page.goto('/');
    await page.getByRole('link', { name: 'Settings' }).click();
    await settingsPage.goToAccountsSection();
  });

  test.skip(
    'submits handle and description in the blocklist creation payload',
    async ({ page }) => {
      const [request] = await Promise.all([
        page.waitForRequest((candidateRequest) => {
          if (!candidateRequest.url().endsWith('/graphql')) {
            return false;
          }

          const body = candidateRequest.postDataJSON();

          return (
            body.operationName === 'CreateOneBlocklist' ||
            JSON.stringify(body.variables ?? {}).includes('"description"')
          );
        }),
        accountsSection.addToBlockList(
          'spam@example.com',
          'Known spam source',
        ),
      ]);

      const requestBody = request.postDataJSON();
      const variablesAsString = JSON.stringify(requestBody.variables ?? {});

      expect(variablesAsString).toContain('"handle":"spam@example.com"');
      expect(variablesAsString).toContain(
        '"description":"Known spam source"',
      );
    },
  );

  test.skip(
    'submits a null description when the optional field is left empty',
    async ({ page }) => {
      const [request] = await Promise.all([
        page.waitForRequest((candidateRequest) => {
          if (!candidateRequest.url().endsWith('/graphql')) {
            return false;
          }

          const body = candidateRequest.postDataJSON();

          return body.operationName === 'CreateOneBlocklist';
        }),
        accountsSection.addToBlockList('badactor.com'),
      ]);

      const requestBody = request.postDataJSON();
      const variablesAsString = JSON.stringify(requestBody.variables ?? {});

      expect(variablesAsString).toContain('"handle":"badactor.com"');
      expect(variablesAsString).toContain('"description":null');
    },
  );
});
