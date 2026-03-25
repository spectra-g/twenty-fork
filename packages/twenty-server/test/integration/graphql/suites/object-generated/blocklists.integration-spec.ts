import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const BLOCKLIST_GQL_FIELDS = `
  id
  handle
  description
  createdAt
  updatedAt
  deletedAt
  workspaceMemberId
`;

const TEST_BLOCKLIST_WITH_DESCRIPTION_ID =
  '11111111-1111-4111-8111-111111111111';
const TEST_BLOCKLIST_WITHOUT_DESCRIPTION_ID =
  '22222222-2222-4222-8222-222222222222';
const TEST_BLOCKLIST_FOR_UPDATE_ID = '33333333-3333-4333-8333-333333333333';

describe('blocklistsResolver (e2e)', () => {
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
              TEST_BLOCKLIST_WITHOUT_DESCRIPTION_ID,
              TEST_BLOCKLIST_FOR_UPDATE_ID,
            ],
          },
        },
      }),
    );
  });

  afterAll(async () => {
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'blocklist',
        objectMetadataPluralName: 'blocklists',
        gqlFields: 'id',
        filter: {
          id: {
            in: [
              TEST_BLOCKLIST_WITH_DESCRIPTION_ID,
              TEST_BLOCKLIST_WITHOUT_DESCRIPTION_ID,
              TEST_BLOCKLIST_FOR_UPDATE_ID,
            ],
          },
        },
      }),
    );
  });

  it('should return description for blocklists query', async () => {
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        data: {
          id: TEST_BLOCKLIST_WITH_DESCRIPTION_ID,
          handle: 'query-description@blocklist.dev',
          description: 'Seeded query description',
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      }),
    );

    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        id: {
          eq: TEST_BLOCKLIST_WITH_DESCRIPTION_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.blocklists;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);
    expect(data.edges).toHaveLength(1);
    expect(data.edges[0].node).toMatchObject({
      id: TEST_BLOCKLIST_WITH_DESCRIPTION_ID,
      handle: 'query-description@blocklist.dev',
      description: 'Seeded query description',
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
  });

  it('should return description when creating a blocklist with description', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      data: {
        id: TEST_BLOCKLIST_WITH_DESCRIPTION_ID,
        handle: 'create-description@blocklist.dev',
        description: 'A test description',
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createBlocklist).toMatchObject({
      id: TEST_BLOCKLIST_WITH_DESCRIPTION_ID,
      handle: 'create-description@blocklist.dev',
      description: 'A test description',
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
  });

  it('should return null description when creating a blocklist without description', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      data: {
        id: TEST_BLOCKLIST_WITHOUT_DESCRIPTION_ID,
        handle: 'create-null-description@blocklist.dev',
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createBlocklist).toMatchObject({
      id: TEST_BLOCKLIST_WITHOUT_DESCRIPTION_ID,
      handle: 'create-null-description@blocklist.dev',
      description: null,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
  });

  it('should return updated description when updating a blocklist description', async () => {
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        data: {
          id: TEST_BLOCKLIST_FOR_UPDATE_ID,
          handle: 'update-description@blocklist.dev',
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      }),
    );

    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      recordId: TEST_BLOCKLIST_FOR_UPDATE_ID,
      data: {
        description: 'Updated description',
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateBlocklist).toMatchObject({
      id: TEST_BLOCKLIST_FOR_UPDATE_ID,
      handle: 'update-description@blocklist.dev',
      description: 'Updated description',
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
  });

  it('should preserve description when updating only the handle', async () => {
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: BLOCKLIST_GQL_FIELDS,
        data: {
          id: TEST_BLOCKLIST_FOR_UPDATE_ID,
          handle: 'before-handle-update@blocklist.dev',
          description: 'Existing persisted description',
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      }),
    );

    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      recordId: TEST_BLOCKLIST_FOR_UPDATE_ID,
      data: {
        handle: '@updated-example.dev',
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateBlocklist).toMatchObject({
      id: TEST_BLOCKLIST_FOR_UPDATE_ID,
      handle: '@updated-example.dev',
      description: 'Existing persisted description',
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
  });
});
