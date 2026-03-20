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

describe('blocklist description schema (integration)', () => {
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
});
