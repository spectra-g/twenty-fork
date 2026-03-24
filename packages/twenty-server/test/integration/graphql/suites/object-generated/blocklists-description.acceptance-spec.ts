// Acceptance: requires live stack — enable in CI or local dev with full environment running.

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

const BLOCKLIST_GQL_FIELDS = `
  id
  handle
  description
  workspaceMemberId
`;

const TEST_BLOCKLIST_WITH_DESCRIPTION_ID =
  '44444444-4444-4444-8444-444444444444';
const TEST_BLOCKLIST_WITH_NULL_DESCRIPTION_ID =
  '55555555-5555-4555-8555-555555555555';
const TEST_BLOCKLIST_FOR_UPDATE_ID = '66666666-6666-4666-8666-666666666666';

describe.skip('blocklistsResolver description acceptance (e2e)', () => {
  beforeAll(async () => {
    await global.dataSeedWorkspaceCommand.run();
  });

  beforeEach(async () => {
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'blocklist',
        objectMetadataPluralName: 'blocklists',
        gqlFields: 'id',
        filter: {
          id: {
            in: [
              TEST_BLOCKLIST_WITH_DESCRIPTION_ID,
              TEST_BLOCKLIST_WITH_NULL_DESCRIPTION_ID,
              TEST_BLOCKLIST_FOR_UPDATE_ID,
            ],
          },
        },
      }),
    );
  });

  it('should pass description through unchanged on create', async () => {
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        data: {
          id: TEST_BLOCKLIST_WITH_DESCRIPTION_ID,
          handle: 'create-description@blocklist.dev',
          description: 'Persist this description once GraphQL boundary is enabled',
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createBlocklist).toMatchObject({
      id: TEST_BLOCKLIST_WITH_DESCRIPTION_ID,
      handle: 'create-description@blocklist.dev',
      description: 'Persist this description once GraphQL boundary is enabled',
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
  });

  it('should allow omitted description by returning null on create', async () => {
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        data: {
          id: TEST_BLOCKLIST_WITH_NULL_DESCRIPTION_ID,
          handle: 'create-null-description@blocklist.dev',
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createBlocklist).toMatchObject({
      id: TEST_BLOCKLIST_WITH_NULL_DESCRIPTION_ID,
      handle: 'create-null-description@blocklist.dev',
      description: null,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
  });

  it('should preserve description when updating handle and description together', async () => {
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        data: {
          id: TEST_BLOCKLIST_FOR_UPDATE_ID,
          handle: 'before-update@blocklist.dev',
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      }),
    );

    const response = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        recordId: TEST_BLOCKLIST_FOR_UPDATE_ID,
        data: {
          handle: '@updated-example.dev',
          description: 'Updated description through GraphQL boundary',
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateBlocklist).toMatchObject({
      id: TEST_BLOCKLIST_FOR_UPDATE_ID,
      handle: '@updated-example.dev',
      description: 'Updated description through GraphQL boundary',
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
  });

  it('should keep the handle validation error when description is present', async () => {
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        data: {
          id: TEST_BLOCKLIST_WITH_DESCRIPTION_ID,
          handle: 'not-a-valid-handle',
          description: 'Description must not mask the handle failure',
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      }),
    );

    expect(response.body.data.createBlocklist).toBeNull();
    expect(response.body.errors?.[0]?.message).toContain(
      'Invalid email or domain',
    );
  });
});
