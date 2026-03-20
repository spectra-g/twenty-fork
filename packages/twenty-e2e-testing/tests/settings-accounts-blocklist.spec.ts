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

const getBlocklistsQuery = `
  query GetBlocklists($filter: BlocklistFilterInput) {
    blocklists(filter: $filter) {
      edges {
        node {
          id
          handle
          description
        }
      }
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

const loginAndGetAuthToken = async (page: Parameters<typeof test.skip>[0]['page']) => {
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

test.describe('Settings accounts blocklist descriptions', () => {
  test.skip('AC-001 should persist null when a blocklist is created without a description', async ({
    page,
  }) => {
    const authToken = await loginAndGetAuthToken(page);
    const settingsPage = new SettingsPage(page);
    const accountsSection = new AccountsSection(page);

    await page.goto('/settings/accounts');
    await settingsPage.goToAccountsSection();

    await accountsSection.addToBlockList('prospect@example.com');
    await accountsSection.expectBlocklistHandle('prospect@example.com');

    const response = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'GetBlocklists',
        query: getBlocklistsQuery,
        variables: {
          filter: {
            handle: {
              eq: 'prospect@example.com',
            },
          },
        },
      },
    });

    const body = await response.json();
    const createdBlocklist = body.data.blocklists.edges[0]?.node;

    expect(body.errors).toBeUndefined();
    expect(createdBlocklist.handle).toBe('prospect@example.com');
    expect(createdBlocklist.description).toBeNull();
  });

  test.skip('AC-002 should persist null when a blocklist is created with an empty description', async ({
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
              handle: 'empty-description@example.com',
              description: '',
            },
          ],
        },
      },
    });

    const createBody = await createResponse.json();

    expect(createBody.errors).toBeUndefined();
    expect(createBody.data.createBlocklists[0].description).toBeNull();
  });

  test.skip('AC-003 should persist null when an existing blocklist description is cleared', async ({
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
              handle: 'clear-description@example.com',
              description: 'Has an initial description',
            },
          ],
        },
      },
    });

    const createBody = await createResponse.json();
    const blocklistId = createBody.data.createBlocklists[0].id;

    const settingsPage = new SettingsPage(page);
    const accountsSection = new AccountsSection(page);

    await page.goto('/settings/accounts');
    await settingsPage.goToAccountsSection();
    await accountsSection.expectBlocklistHandle('clear-description@example.com');
    await accountsSection.openDescriptionEditor('clear-description@example.com');
    await accountsSection.clearDescriptionEditor();
    await accountsSection.saveDescriptionEditor();

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
            description: '',
          },
        },
      },
    });

    const updateBody = await updateResponse.json();

    expect(updateBody.errors).toBeUndefined();
    expect(updateBody.data.updateBlocklist.description).toBeNull();
  });
});
