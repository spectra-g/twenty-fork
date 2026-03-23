// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('blocklistsResolver (e2e)', () => {
  it.skip('AC-001 should create a blocklist with description and return it from a follow-up query', async () => {
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
          handle: 'acceptance-create@example.com',
          description: 'Created through the GraphQL acceptance flow',
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
      handle: 'acceptance-create@example.com',
      description: 'Created through the GraphQL acceptance flow',
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
      handle: 'acceptance-create@example.com',
      description: 'Created through the GraphQL acceptance flow',
      workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
    });
  });

  it.skip('AC-002 should expose description on the blocklist query response', async () => {
    const queryData = {
      query: `
        query blocklist($id: String!) {
          blocklist(id: $id) {
            id
            handle
            description
            workspaceMemberId
            createdAt
            updatedAt
            deletedAt
          }
        }
      `,
      variables: {
        id: APPLE_JANE_BLOCKLIST_ID,
      },
    };

    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.blocklist).toEqual(
      expect.objectContaining({
        id: APPLE_JANE_BLOCKLIST_ID,
        handle: expect.any(String),
        description: expect.anything(),
        workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deletedAt: null,
      }),
    );
  });

  it.skip('AC-003 should update a blocklist description and return the updated value from a follow-up query', async () => {
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
          handle: 'acceptance-update@example.com',
          description: 'Original acceptance description',
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
          description: 'Updated through the GraphQL acceptance flow',
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
      handle: 'acceptance-update@example.com',
      description: 'Updated through the GraphQL acceptance flow',
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
      handle: 'acceptance-update@example.com',
      description: 'Updated through the GraphQL acceptance flow',
      workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
    });
  });

  it.skip('should preserve handle validation rules when description is also provided', () => {
    const invalidHandleMutationData = {
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
          handle: 'not-an-email',
          description: 'Still invalid because the handle format is wrong',
          workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        },
      },
    };

    const duplicateHandleMutationData = {
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
          handle: 'acceptance-duplicate@example.com',
          description: 'First create succeeds',
          workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        },
      },
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(invalidHandleMutationData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.createBlocklist).toBeNull();
        expect(res.body.errors?.[0]?.message).toContain(
          'Invalid email or domain',
        );
      })
      .then(() =>
        client
          .post('/graphql')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(duplicateHandleMutationData)
          .expect(200)
          .expect((res) => {
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.createBlocklist).toMatchObject({
              handle: 'acceptance-duplicate@example.com',
              description: 'First create succeeds',
            });
          })
          .then(() =>
            client
              .post('/graphql')
              .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
              .send({
                ...duplicateHandleMutationData,
                variables: {
                  data: {
                    handle: 'acceptance-duplicate@example.com',
                    description:
                      'Second create should still fail duplicate validation',
                    workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
                  },
                },
              })
              .expect(200)
              .expect((res) => {
                expect(res.body.data.createBlocklist).toBeNull();
                expect(res.body.errors?.[0]?.message).toContain(
                  'Blocklist handle already exists',
                );
              }),
          ),
      );
  });
});
