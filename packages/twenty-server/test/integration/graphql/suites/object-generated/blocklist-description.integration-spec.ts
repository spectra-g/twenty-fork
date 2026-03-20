// Acceptance: requires live stack — enable in CI or local dev with full environment running.
/* global APP_PORT, APPLE_JANE_ADMIN_ACCESS_TOKEN */
import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

const INTROSPECTION_QUERY = `
  query BlocklistDescriptionSchema {
    blocklistObject: __type(name: "Blocklist") {
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
    blocklistCreateInput: __type(name: "BlocklistCreateInput") {
      name
      inputFields {
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
    blocklistUpdateInput: __type(name: "BlocklistUpdateInput") {
      name
      inputFields {
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

describe.skip('blocklist description schema (integration)', () => {
  it('should expose description on the Blocklist object type as a nullable String', async () => {
    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({ query: INTROSPECTION_QUERY })
      .expect(200);

    expect(response.body.errors).toBeUndefined();

    const descriptionField = response.body.data.blocklistObject.fields.find(
      (field: { name: string }) => field.name === 'description',
    );

    expect(descriptionField).toBeDefined();
    expect(descriptionField.type.kind).toBe('SCALAR');
    expect(descriptionField.type.name).toBe('String');
  });

  it('should expose description on the BlocklistCreateInput type as an optional String', async () => {
    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({ query: INTROSPECTION_QUERY })
      .expect(200);

    expect(response.body.errors).toBeUndefined();

    const descriptionField =
      response.body.data.blocklistCreateInput.inputFields.find(
        (field: { name: string }) => field.name === 'description',
      );

    expect(descriptionField).toBeDefined();
    expect(descriptionField.type.kind).toBe('SCALAR');
    expect(descriptionField.type.name).toBe('String');
  });

  it('should expose description on the BlocklistUpdateInput type as an optional String', async () => {
    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({ query: INTROSPECTION_QUERY })
      .expect(200);

    expect(response.body.errors).toBeUndefined();

    const descriptionField =
      response.body.data.blocklistUpdateInput.inputFields.find(
        (field: { name: string }) => field.name === 'description',
      );

    expect(descriptionField).toBeDefined();
    expect(descriptionField.type.kind).toBe('SCALAR');
    expect(descriptionField.type.name).toBe('String');
  });

  it('should create a blocklist record with description and return the same description when queried back', async () => {
    const createResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateBlocklistWithDescription($data: BlocklistCreateInput!) {
            createBlocklist(data: $data) {
              id
              handle
              description
            }
          }
        `,
        variables: {
          data: {
            handle: 'blocked-create@example.com',
            description: 'Created from acceptance coverage',
          },
        },
      })
      .expect(200);

    expect(createResponse.body.errors).toBeUndefined();

    const createdBlocklist = createResponse.body.data.createBlocklist;

    expect(createdBlocklist.handle).toBe('blocked-create@example.com');
    expect(createdBlocklist.description).toBe(
      'Created from acceptance coverage',
    );

    const findResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query FindBlocklistById($id: UUID!) {
            blocklist(id: $id) {
              id
              handle
              description
            }
          }
        `,
        variables: {
          id: createdBlocklist.id,
        },
      })
      .expect(200);

    expect(findResponse.body.errors).toBeUndefined();
    expect(findResponse.body.data.blocklist).toMatchObject({
      id: createdBlocklist.id,
      handle: 'blocked-create@example.com',
      description: 'Created from acceptance coverage',
    });
  });

  it('should preserve existing blocklist data when description is added later and then updated', async () => {
    const createLegacyLikeResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateLegacyLikeBlocklist($data: BlocklistCreateInput!) {
            createBlocklist(data: $data) {
              id
              handle
              description
            }
          }
        `,
        variables: {
          data: {
            handle: 'blocked-legacy@example.com',
          },
        },
      })
      .expect(200);

    expect(createLegacyLikeResponse.body.errors).toBeUndefined();

    const createdBlocklist = createLegacyLikeResponse.body.data.createBlocklist;

    expect(createdBlocklist).toMatchObject({
      handle: 'blocked-legacy@example.com',
      description: null,
    });

    const updateResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateBlocklistDescription($id: UUID!, $data: BlocklistUpdateInput!) {
            updateBlocklist(id: $id, data: $data) {
              id
              handle
              description
            }
          }
        `,
        variables: {
          id: createdBlocklist.id,
          data: {
            description: 'Added after record creation',
          },
        },
      })
      .expect(200);

    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updateBlocklist).toMatchObject({
      id: createdBlocklist.id,
      handle: 'blocked-legacy@example.com',
      description: 'Added after record creation',
    });
  });
});
