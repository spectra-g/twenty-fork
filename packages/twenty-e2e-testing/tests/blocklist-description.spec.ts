// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '@playwright/test';

import { backendGraphQLUrl } from '../lib/requests/backend';
import { LoginPage } from '../lib/pom/loginPage';
import { getAccessAuthToken } from '../lib/utils/getAccessAuthToken';

const blocklistTypeIntrospectionQuery = `
  query BlocklistTypeIntrospection {
    __type(name: "Blocklist") {
      name
      fields {
        name
        type {
          kind
          name
          ofType {
            kind
            name
          }
        }
      }
    }
  }
`;

const createBlocklistMutation = `
  mutation CreateBlocklist($data: [BlocklistCreateInput!]!) {
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

test.describe('Blocklist description GraphQL contract', () => {
  test.skip('AC-001 should expose a nullable description field on the Blocklist GraphQL type', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await page.goto('/signin');
    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.typeEmail('tim@apple.dev');
    await loginPage.clickContinueButton();
    await loginPage.typePassword('password');
    await loginPage.clickSignInButton();

    const { authToken } = await getAccessAuthToken(page);
    const response = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'BlocklistTypeIntrospection',
        query: blocklistTypeIntrospectionQuery,
      },
    });

    const body = await response.json();
    const descriptionField = body.data.__type.fields.find(
      (field: { name: string }) => field.name === 'description',
    );

    expect(descriptionField).toBeDefined();
    expect(descriptionField.type.kind).toBe('SCALAR');
    expect(descriptionField.type.name).toBe('String');
  });

  test.skip('AC-002 should accept and return description through createBlocklists', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await page.goto('/signin');
    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.typeEmail('tim@apple.dev');
    await loginPage.clickContinueButton();
    await loginPage.typePassword('password');
    await loginPage.clickSignInButton();

    const { authToken } = await getAccessAuthToken(page);
    const response = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'CreateBlocklist',
        query: createBlocklistMutation,
        variables: {
          data: [
            {
              handle: 'prospect@example.com',
              description: 'Inbound lead from conference follow-up',
            },
          ],
        },
      },
    });

    const body = await response.json();

    expect(body.errors).toBeUndefined();
    expect(body.data.createBlocklists).toHaveLength(1);
    expect(body.data.createBlocklists[0].handle).toBe('prospect@example.com');
    expect(body.data.createBlocklists[0].description).toBe(
      'Inbound lead from conference follow-up',
    );
  });

  test.skip('AC-003 should accept and return description through updateBlocklist', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await page.goto('/signin');
    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.typeEmail('tim@apple.dev');
    await loginPage.clickContinueButton();
    await loginPage.typePassword('password');
    await loginPage.clickSignInButton();

    const { authToken } = await getAccessAuthToken(page);
    const createResponse = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'CreateBlocklist',
        query: createBlocklistMutation,
        variables: {
          data: [
            {
              handle: 'prospect@example.com',
              description: 'Inbound lead from conference follow-up',
            },
          ],
        },
      },
    });

    const createBody = await createResponse.json();
    const createdBlocklistId = createBody.data.createBlocklists[0].id;

    const updateResponse = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'UpdateBlocklist',
        query: updateBlocklistMutation,
        variables: {
          blocklistId: createdBlocklistId,
          data: {
            description: 'Updated after contact requested no follow-up',
          },
        },
      },
    });

    const updateBody = await updateResponse.json();

    expect(updateBody.errors).toBeUndefined();
    expect(updateBody.data.updateBlocklist.id).toBe(createdBlocklistId);
    expect(updateBody.data.updateBlocklist.description).toBe(
      'Updated after contact requested no follow-up',
    );
  });
});
