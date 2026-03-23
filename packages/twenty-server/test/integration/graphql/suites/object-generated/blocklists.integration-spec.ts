// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('blocklistsResolver (e2e)', () => {
  it.skip('AC-001 should expose nullable description on blocklists query nodes', () => {
    const queryData = {
      query: `
        query blocklists {
          blocklists {
            edges {
              node {
                handle
                description
                id
                createdAt
                updatedAt
                deletedAt
                workspaceMemberId
              }
            }
          }
        }
      `,
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.blocklists;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const blocklists = edges[0].node;

          expect(blocklists).toHaveProperty('handle');
          expect(blocklists).toHaveProperty('description');
          expect(blocklists).toHaveProperty('id');
          expect(blocklists).toHaveProperty('createdAt');
          expect(blocklists).toHaveProperty('updatedAt');
          expect(blocklists).toHaveProperty('deletedAt');
          expect(blocklists).toHaveProperty('workspaceMemberId');
        }
      });
  });

  it.skip('AC-002 should accept description in createBlocklist input', () => {
    const mutationData = {
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
          description: 'Schema acceptance for create input',
          workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        },
      },
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(mutationData)
      .expect(200)
      .expect((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.createBlocklist).toMatchObject({
          handle: 'acceptance-create@example.com',
          description: 'Schema acceptance for create input',
          workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        });
      });
  });

  it.skip('AC-003 should accept description in updateBlocklist input', () => {
    const mutationData = {
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
        id: APPLE_JANE_BLOCKLIST_ID,
        data: {
          description: 'Schema acceptance for update input',
          workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        },
      },
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(mutationData)
      .expect(200)
      .expect((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.updateBlocklist).toMatchObject({
          id: APPLE_JANE_BLOCKLIST_ID,
          description: 'Schema acceptance for update input',
          workspaceMemberId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        });
      });
  });
});
