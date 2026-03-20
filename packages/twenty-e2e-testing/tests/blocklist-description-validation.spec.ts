// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '@playwright/test';

import { backendGraphQLUrl } from '../lib/requests/backend';
import { AccountsSection } from '../lib/pom/settings/accountsSection';
import { LoginPage } from '../lib/pom/loginPage';
import { SettingsPage } from '../lib/pom/settingsPage';
import { getAccessAuthToken } from '../lib/utils/getAccessAuthToken';

const createBlocklistMutation = `
  mutation CreateBlocklists($data: [BlocklistCreateInput!]!) {
    createBlocklists(data: $data) {
      id
      handle
      description
    }
  }
`;

const updateBlocklistMutation = `
  mutation UpdateBlocklist($blocklistId: UUID!, $data: BlocklistUpdateInput!) {
    updateBlocklist(id: $blocklistId, data: $data) {
      id
      handle
      description
    }
  }
`;

const loginAndGetAuthToken = async (
  page: Parameters<typeof test.skip>[0]['page'],
) => {
  const loginPage = new LoginPage(page);

  await page.goto('/signin');
  await loginPage.clickLoginWithEmailIfVisible();
  await loginPage.typeEmail('tim@apple.dev');
  await loginPage.clickContinueButton();
  await loginPage.typePassword('password');
  await loginPage.clickSignInButton();

  const { authToken } = await getAccessAuthToken(page);

  return authToken;
};

test.describe('Blocklist description validation', () => {
  test.skip('AC-001 should reject blocklist create requests with a 256-character description', async ({
    page,
  }) => {
    const authToken = await loginAndGetAuthToken(page);
    const overLimitDescription = 'a'.repeat(256);

    const response = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'CreateBlocklists',
        query: createBlocklistMutation,
        variables: {
          data: [
            {
              handle: 'create-validation@example.com',
              description: overLimitDescription,
            },
          ],
        },
      },
    });

    const body = await response.json();

    expect(body.data).toBeNull();
    expect(body.errors[0].message).toContain(
      'Description must be 255 characters or less',
    );
  });

  test.skip('AC-002 should reject blocklist update requests with a 256-character description and keep the editor open', async ({
    page,
  }) => {
    const authToken = await loginAndGetAuthToken(page);
    const createResponse = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'CreateBlocklists',
        query: createBlocklistMutation,
        variables: {
          data: [
            {
              handle: 'update-validation@example.com',
              description: 'Initial description',
            },
          ],
        },
      },
    });

    const createBody = await createResponse.json();
    const blocklistId = createBody.data.createBlocklists[0].id;
    const overLimitDescription = 'b'.repeat(256);

    const updateResponse = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'UpdateBlocklist',
        query: updateBlocklistMutation,
        variables: {
          blocklistId,
          data: {
            description: overLimitDescription,
          },
        },
      },
    });

    const updateBody = await updateResponse.json();

    expect(updateBody.data).toBeNull();
    expect(updateBody.errors[0].message).toContain(
      'Description must be 255 characters or less',
    );

    const settingsPage = new SettingsPage(page);
    const accountsSection = new AccountsSection(page);

    await page.goto('/settings/accounts');
    await settingsPage.goToAccountsSection();
    await accountsSection.openDescriptionEditor('update-validation@example.com');
    await accountsSection.fillDescriptionEditor(overLimitDescription);
    await accountsSection.saveDescriptionEditor();

    await accountsSection.expectDescriptionValidationMessage(
      'Description must be 255 characters or less',
    );
  });

  test.skip('AC-003 should block the 256th description character and show the max-length counter', async ({
    page,
  }) => {
    const authToken = await loginAndGetAuthToken(page);
    const createResponse = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'CreateBlocklists',
        query: createBlocklistMutation,
        variables: {
          data: [
            {
              handle: 'counter-validation@example.com',
              description: null,
            },
          ],
        },
      },
    });

    const createBody = await createResponse.json();

    expect(createBody.errors).toBeUndefined();

    const settingsPage = new SettingsPage(page);
    const accountsSection = new AccountsSection(page);

    await page.goto('/settings/accounts');
    await settingsPage.goToAccountsSection();
    await accountsSection.openDescriptionEditor(
      'counter-validation@example.com',
    );

    const maxLengthDescription = 'c'.repeat(255);

    await accountsSection.fillDescriptionEditor(maxLengthDescription);
    await accountsSection.expectDescriptionCounter('255/255');
    await accountsSection.expectDescriptionEditorValue(maxLengthDescription);

    await accountsSection.fillDescriptionEditor(`${maxLengthDescription}d`);
    await accountsSection.expectDescriptionCounter('255/255');
    await accountsSection.expectDescriptionEditorValue(maxLengthDescription);
  });
});
