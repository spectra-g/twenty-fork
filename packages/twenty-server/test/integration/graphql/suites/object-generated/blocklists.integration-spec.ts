// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('blocklistsResolver (e2e)', () => {
  it.skip('AC-001 should create a blocklist without description and return null', async () => {
    const createMutationData = {
      query: `
          mutation createBlocklist($data: CreateBlocklistInput!) {
            createBlocklist(data: $data) {
              id
              handle
              description
              workspaceMemberId
            }
          }
        `,
      variables: {
        data: {
          handle: 'acceptance-create-no-description@example.com',
          workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        },
      },
    };
    const queryData = {
      query: `
          query blocklist($id: String!) {
            blocklist(id: $id) {
              id
              handle
              description
              workspaceMemberId
            }
          }
        `,
      variables: {
        id: '',
      },
    };

    const createResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(createMutationData)
      .expect(200);

    expect(createResponse.body.errors).toBeUndefined();
    expect(createResponse.body.data.createBlocklist).toMatchObject({
      handle: 'acceptance-create-no-description@example.com',
      description: null,
      workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
    });

    queryData.variables.id = createResponse.body.data.createBlocklist.id;

    const queryResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200);

    expect(queryResponse.body.errors).toBeUndefined();
    expect(queryResponse.body.data.blocklist).toMatchObject({
      id: createResponse.body.data.createBlocklist.id,
      handle: 'acceptance-create-no-description@example.com',
      description: null,
      workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
    });
  });

  it.skip('AC-002 should create a blocklist with an explicit null description and return null', async () => {
    const createMutationData = {
      query: `
          mutation createBlocklist($data: CreateBlocklistInput!) {
            createBlocklist(data: $data) {
              id
              handle
              description
              workspaceMemberId
            }
          }
        `,
      variables: {
        data: {
          handle: 'acceptance-create-null-description@example.com',
          description: null,
          workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        },
      },
    };

    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(createMutationData)
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createBlocklist).toMatchObject({
      handle: 'acceptance-create-null-description@example.com',
      description: null,
      workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
    });
  });

  it.skip('AC-003 should preserve an existing description when update omits the description field', async () => {
    const createMutationData = {
      query: `
          mutation createBlocklist($data: CreateBlocklistInput!) {
            createBlocklist(data: $data) {
              id
              handle
              description
              workspaceMemberId
            }
          }
        `,
      variables: {
        data: {
          handle: 'acceptance-preserve-description@example.com',
          description: 'Original description should be preserved',
          workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        },
      },
    };
    const updateMutationData = {
      query: `
        mutation updateBlocklist($id: String!, $data: UpdateBlocklistInput!) {
          updateBlocklist(id: $id, data: $data) {
            id
            handle
            description
            workspaceMemberId
          }
        }
      `,
      variables: {
        id: '',
        data: {
          handle: 'acceptance-preserve-description-renamed@example.com',
        },
      },
    };
    const queryData = {
      query: `
          query blocklist($id: String!) {
            blocklist(id: $id) {
              id
              handle
              description
              workspaceMemberId
            }
          }
        `,
      variables: {
        id: '',
      },
    };

    const createResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(createMutationData)
      .expect(200);

    expect(createResponse.body.errors).toBeUndefined();

    updateMutationData.variables.id =
      createResponse.body.data.createBlocklist.id;
    queryData.variables.id = createResponse.body.data.createBlocklist.id;

    const updateResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(updateMutationData)
      .expect(200);

    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updateBlocklist).toMatchObject({
      id: createResponse.body.data.createBlocklist.id,
      handle: 'acceptance-preserve-description-renamed@example.com',
      description: 'Original description should be preserved',
      workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
    });

    const queryResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200);

    expect(queryResponse.body.errors).toBeUndefined();
    expect(queryResponse.body.data.blocklist).toMatchObject({
      id: createResponse.body.data.createBlocklist.id,
      handle: 'acceptance-preserve-description-renamed@example.com',
      description: 'Original description should be preserved',
      workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
    });
  });

  it.skip('AC-004 should reject a 256-character description with a max-length validation error', async () => {
    const mutationData = {
      query: `
        mutation createBlocklist($data: CreateBlocklistInput!) {
          createBlocklist(data: $data) {
            id
            handle
            description
          }
        }
      `,
      variables: {
        data: {
          handle: 'acceptance-too-long@example.com',
          description: 'a'.repeat(256),
          workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        },
      },
    };

    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(mutationData)
      .expect(200);

    expect(response.body.data.createBlocklist).toBeNull();
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining('255'),
        }),
      ]),
    );
  });

  it.skip('AC-005 should accept a 255-character description and persist it', async () => {
    const maxLengthDescription = 'b'.repeat(255);
    const createMutationData = {
      query: `
        mutation createBlocklist($data: CreateBlocklistInput!) {
          createBlocklist(data: $data) {
            id
            handle
            description
            workspaceMemberId
          }
        }
      `,
      variables: {
        data: {
          handle: 'acceptance-max-length@example.com',
          description: maxLengthDescription,
          workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        },
      },
    };

    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(createMutationData)
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createBlocklist).toMatchObject({
      handle: 'acceptance-max-length@example.com',
      description: maxLengthDescription,
      workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
    });
  });
});
