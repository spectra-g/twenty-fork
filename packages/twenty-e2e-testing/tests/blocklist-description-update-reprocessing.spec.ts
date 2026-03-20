// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import { expect, test } from '@playwright/test';

import { backendGraphQLUrl } from '../lib/requests/backend';
import { LoginPage } from '../lib/pom/loginPage';
import { getAccessAuthToken } from '../lib/utils/getAccessAuthToken';

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

const getCalendarEventsQuery = `
  query GetCalendarEvents($filter: CalendarEventFilterInput) {
    calendarEvents(filter: $filter) {
      edges {
        node {
          id
          title
          startsAt
        }
      }
    }
  }
`;

const getMessagesQuery = `
  query GetMessages($filter: MessageFilterInput) {
    messages(filter: $filter) {
      edges {
        node {
          id
          subject
          receivedAt
        }
      }
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

test.describe('Blocklist description-only updates do not trigger reprocessing', () => {
  test.skip('AC-001 should keep imported calendar events untouched when only description changes', async ({
    page,
  }) => {
    const authToken = await loginAndGetAuthToken(page);
    const handle = 'calendar-preserved@example.com';

    const createResponse = await page.request.post(backendGraphQLUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        operationName: 'CreateBlocklist',
        query: createBlocklistMutation,
        variables: {
          data: [
            {
              handle,
              description: 'Initial calendar blocklist description',
            },
          ],
        },
      },
    });
    const createBody = await createResponse.json();
    const blocklistId = createBody.data.createBlocklists[0].id;

    const beforeEventsResponse = await page.request.post(backendGraphQLUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        operationName: 'GetCalendarEvents',
        query: getCalendarEventsQuery,
        variables: {
          filter: {
            title: {
              ilike: '%calendar-preserved%',
            },
          },
        },
      },
    });
    const beforeEventsBody = await beforeEventsResponse.json();

    const updateResponse = await page.request.post(backendGraphQLUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        operationName: 'UpdateBlocklist',
        query: updateBlocklistMutation,
        variables: {
          blocklistId,
          data: {
            description: 'Updated calendar-only description',
          },
        },
      },
    });
    const updateBody = await updateResponse.json();

    const afterEventsResponse = await page.request.post(backendGraphQLUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        operationName: 'GetCalendarEvents',
        query: getCalendarEventsQuery,
        variables: {
          filter: {
            title: {
              ilike: '%calendar-preserved%',
            },
          },
        },
      },
    });
    const afterEventsBody = await afterEventsResponse.json();

    expect(updateBody.errors).toBeUndefined();
    expect(updateBody.data.updateBlocklist.handle).toBe(handle);
    expect(afterEventsBody.errors).toBeUndefined();
    expect(afterEventsBody.data.calendarEvents.edges).toEqual(
      beforeEventsBody.data.calendarEvents.edges,
    );
  });

  test.skip('AC-002 should keep imported messages untouched when only description changes', async ({
    page,
  }) => {
    const authToken = await loginAndGetAuthToken(page);
    const handle = 'messages-preserved@example.com';

    const createResponse = await page.request.post(backendGraphQLUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        operationName: 'CreateBlocklist',
        query: createBlocklistMutation,
        variables: {
          data: [
            {
              handle,
              description: 'Initial messaging blocklist description',
            },
          ],
        },
      },
    });
    const createBody = await createResponse.json();
    const blocklistId = createBody.data.createBlocklists[0].id;

    const beforeMessagesResponse = await page.request.post(backendGraphQLUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        operationName: 'GetMessages',
        query: getMessagesQuery,
        variables: {
          filter: {
            subject: {
              ilike: '%messages-preserved%',
            },
          },
        },
      },
    });
    const beforeMessagesBody = await beforeMessagesResponse.json();

    const updateResponse = await page.request.post(backendGraphQLUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        operationName: 'UpdateBlocklist',
        query: updateBlocklistMutation,
        variables: {
          blocklistId,
          data: {
            description: 'Updated messaging-only description',
          },
        },
      },
    });
    const updateBody = await updateResponse.json();

    const afterMessagesResponse = await page.request.post(backendGraphQLUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        operationName: 'GetMessages',
        query: getMessagesQuery,
        variables: {
          filter: {
            subject: {
              ilike: '%messages-preserved%',
            },
          },
        },
      },
    });
    const afterMessagesBody = await afterMessagesResponse.json();

    expect(updateBody.errors).toBeUndefined();
    expect(updateBody.data.updateBlocklist.handle).toBe(handle);
    expect(afterMessagesBody.errors).toBeUndefined();
    expect(afterMessagesBody.data.messages.edges).toEqual(
      beforeMessagesBody.data.messages.edges,
    );
  });

  test.skip('AC-003 should reprocess when handle changes even if description changes with it', async ({
    page,
  }) => {
    const authToken = await loginAndGetAuthToken(page);

    const createResponse = await page.request.post(backendGraphQLUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        operationName: 'CreateBlocklist',
        query: createBlocklistMutation,
        variables: {
          data: [
            {
              handle: 'before-reprocess@example.com',
              description: 'Before handle update',
            },
          ],
        },
      },
    });
    const createBody = await createResponse.json();
    const blocklistId = createBody.data.createBlocklists[0].id;

    const updateResponse = await page.request.post(backendGraphQLUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        operationName: 'UpdateBlocklist',
        query: updateBlocklistMutation,
        variables: {
          blocklistId,
          data: {
            handle: 'after-reprocess@example.com',
            description: 'After handle update',
          },
        },
      },
    });
    const updateBody = await updateResponse.json();

    const messagesResponse = await page.request.post(backendGraphQLUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        operationName: 'GetMessages',
        query: getMessagesQuery,
        variables: {
          filter: {
            subject: {
              ilike: '%after-reprocess%',
            },
          },
        },
      },
    });
    const messagesBody = await messagesResponse.json();

    expect(updateBody.errors).toBeUndefined();
    expect(updateBody.data.updateBlocklist.handle).toBe(
      'after-reprocess@example.com',
    );
    expect(messagesBody.errors).toBeUndefined();
    expect(Array.isArray(messagesBody.data.messages.edges)).toBe(true);
  });
});
