/* eslint-disable @nx/enforce-module-boundaries */
import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { fetchTestFieldMetadataIds } from 'test/integration/metadata/suites/page-layout-widget/utils/fetch-test-field-metadata-ids.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  AggregateOperations,
  RowLevelPermissionPredicateOperand,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Chart data dashboard filters', () => {
  const client = request(`http://localhost:${APP_PORT}`);
  const testCompanyId = randomUUID();
  const screeningOpportunityId = randomUUID();
  const newOpportunityId = randomUUID();

  let opportunityObjectMetadataId: string;
  let opportunityStageFieldMetadataId: string;
  let opportunityAmountFieldMetadataId: string;
  let opportunityNameFieldMetadataId: string;
  let opportunityCreatedAtFieldMetadataId: string;
  let companyNameFieldMetadataId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 100 },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });

    const opportunityObject = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'opportunity',
    );
    const companyObject = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'company',
    );

    if (!opportunityObject?.fieldsList || !companyObject?.fieldsList) {
      throw new Error(
        'Expected opportunity and company metadata in test setup',
      );
    }

    opportunityObjectMetadataId = opportunityObject.id;
    opportunityStageFieldMetadataId = opportunityObject.fieldsList.find(
      (field) => field.name === 'stage',
    )!.id;
    opportunityAmountFieldMetadataId = opportunityObject.fieldsList.find(
      (field) => field.name === 'amount',
    )!.id;
    opportunityNameFieldMetadataId = opportunityObject.fieldsList.find(
      (field) => field.name === 'name',
    )!.id;
    opportunityCreatedAtFieldMetadataId = opportunityObject.fieldsList.find(
      (field) => field.name === 'createdAt',
    )!.id;
    companyNameFieldMetadataId = companyObject.fieldsList.find(
      (field) => field.name === 'name',
    )!.id;

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        data: {
          id: testCompanyId,
          name: 'Chart Filter Company',
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id',
        data: {
          id: screeningOpportunityId,
          stage: 'SCREENING',
          name: 'Screening Opportunity',
          amount: { amountMicros: 1000000 },
          companyId: testCompanyId,
          createdAt: '2020-02-05T08:00:00.000Z',
          closeDate: '2025-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id',
        data: {
          id: newOpportunityId,
          stage: 'NEW',
          name: 'New Opportunity',
          amount: { amountMicros: 2000000 },
          companyId: testCompanyId,
          createdAt: '2020-02-05T08:00:00.000Z',
          closeDate: '2025-02-06T08:00:00.000Z',
        },
      }),
    );
  });

  afterAll(async () => {
    for (const recordId of [screeningOpportunityId, newOpportunityId]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'opportunity',
          gqlFields: 'id',
          recordId,
        }),
      );
    }

    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: testCompanyId,
      }),
    );
  });

  it('should accept dashboardFilters in barChartData input', async () => {
    const { objectMetadataId, fieldMetadataId1, fieldMetadataId2 } =
      await fetchTestFieldMetadataIds();

    const response = await makeGraphqlAPIRequest({
      query: gql`
        query BarChartData($input: BarChartDataInput!) {
          barChartData(input: $input) {
            data
            indexBy
            keys
          }
        }
      `,
      variables: {
        input: {
          objectMetadataId,
          configuration: {
            configurationType: WidgetConfigurationType.BAR_CHART,
            aggregateFieldMetadataId: fieldMetadataId1,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: fieldMetadataId2,
            layout: BarChartLayout.VERTICAL,
            groupMode: BarChartGroupMode.GROUPED,
          },
          dashboardFilters: [
            {
              fieldMetadataId: fieldMetadataId2,
              operand: ViewFilterOperand.CONTAINS,
              value: 'Acme',
            },
          ],
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.barChartData).toBeDefined();
  });

  it('should apply dashboard and widget filters with AND semantics', async () => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        query BarChartData($input: BarChartDataInput!) {
          barChartData(input: $input) {
            data
            indexBy
            keys
          }
        }
      `,
      variables: {
        input: {
          objectMetadataId: opportunityObjectMetadataId,
          configuration: {
            configurationType: WidgetConfigurationType.BAR_CHART,
            aggregateFieldMetadataId: opportunityAmountFieldMetadataId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: opportunityStageFieldMetadataId,
            layout: BarChartLayout.VERTICAL,
            groupMode: BarChartGroupMode.GROUPED,
            filter: {
              recordFilters: [
                {
                  fieldMetadataId: opportunityStageFieldMetadataId,
                  operand: ViewFilterOperand.IS,
                  value: 'SCREENING',
                },
              ],
              recordFilterGroups: [],
            },
          },
          dashboardFilters: [
            {
              fieldMetadataId: opportunityStageFieldMetadataId,
              operand: ViewFilterOperand.IS,
              value: 'NEW',
            },
          ],
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.barChartData.data).toEqual([]);
  });

  it('should ignore dashboard filters that do not apply to the widget object while keeping applicable ones', async () => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        query BarChartData($input: BarChartDataInput!) {
          barChartData(input: $input) {
            data
            indexBy
            keys
          }
        }
      `,
      variables: {
        input: {
          objectMetadataId: opportunityObjectMetadataId,
          configuration: {
            configurationType: WidgetConfigurationType.BAR_CHART,
            aggregateFieldMetadataId: opportunityAmountFieldMetadataId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: opportunityStageFieldMetadataId,
            layout: BarChartLayout.VERTICAL,
            groupMode: BarChartGroupMode.GROUPED,
            filter: {
              recordFilters: [
                {
                  fieldMetadataId: opportunityStageFieldMetadataId,
                  operand: ViewFilterOperand.IS,
                  value: 'SCREENING',
                },
              ],
              recordFilterGroups: [],
            },
          },
          dashboardFilters: [
            {
              fieldMetadataId: companyNameFieldMetadataId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'Chart Filter Company',
            },
            {
              fieldMetadataId: opportunityStageFieldMetadataId,
              operand: ViewFilterOperand.IS,
              value: 'NEW',
            },
          ],
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.barChartData.data).toEqual([]);
  });

  describe('row-level permission precedence', () => {
    const permittedRecentOpportunityId = randomUUID();
    const permittedOldOpportunityId = randomUUID();
    const deniedRecentOpportunityId = randomUUID();
    const permittedRecentOpportunityName = `Story 73 Permitted Recent ${randomUUID()}`;
    const permittedOldOpportunityName = `Story 73 Permitted Old ${randomUUID()}`;
    const deniedRecentOpportunityName = `Story 73 Denied Recent ${randomUUID()}`;

    let originalMemberRoleId: string;
    let restrictedRoleId: string;

    const getBarChartDataAsMember = async ({
      filter,
      dashboardFilters,
    }: {
      filter?: {
        recordFilters: Array<{
          fieldMetadataId: string;
          operand: ViewFilterOperand;
          value: string;
        }>;
        recordFilterGroups: [];
      };
      dashboardFilters?: Array<{
        fieldMetadataId: string;
        operand: ViewFilterOperand;
        value: string;
      }>;
    }) =>
      makeGraphqlAPIRequestWithMemberRole({
        query: gql`
          query BarChartData($input: BarChartDataInput!) {
            barChartData(input: $input) {
              data
              indexBy
              keys
            }
          }
        `,
        variables: {
          input: {
            objectMetadataId: opportunityObjectMetadataId,
            configuration: {
              configurationType: WidgetConfigurationType.BAR_CHART,
              aggregateFieldMetadataId: opportunityAmountFieldMetadataId,
              aggregateOperation: AggregateOperations.COUNT,
              primaryAxisGroupByFieldMetadataId: opportunityNameFieldMetadataId,
              layout: BarChartLayout.VERTICAL,
              groupMode: BarChartGroupMode.GROUPED,
              filter,
            },
            dashboardFilters,
          },
        },
      });

    beforeAll(async () => {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED,
        value: true,
        expectToFail: false,
      });

      const rolesResponse = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query GetRoles {
              getRoles {
                id
                label
              }
            }
          `,
        });

      originalMemberRoleId = rolesResponse.body.data.getRoles.find(
        (role: { label: string }) => role.label === 'Member',
      ).id;

      const { data } = await createOneRole({
        expectToFail: false,
        input: {
          label: `Chart Filter Restricted ${randomUUID()}`,
          description: 'Role for chart filter permission tests',
          icon: 'IconChartBar',
          canUpdateAllSettings: false,
          canAccessAllTools: true,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
          canBeAssignedToAgents: false,
          canBeAssignedToApiKeys: false,
        },
      });

      restrictedRoleId = data.createOneRole.id;

      await makeGraphqlAPIRequest({
        query: gql`
          mutation UpsertObjectPermissions(
            $roleId: UUID!
            $objectPermissions: [ObjectPermissionInput!]!
          ) {
            upsertObjectPermissions(
              upsertObjectPermissionsInput: {
                roleId: $roleId
                objectPermissions: $objectPermissions
              }
            ) {
              objectMetadataId
              canReadObjectRecords
            }
          }
        `,
        variables: {
          roleId: restrictedRoleId,
          objectPermissions: [
            {
              objectMetadataId: opportunityObjectMetadataId,
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        },
      });

      await upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId: restrictedRoleId,
          objectMetadataId: opportunityObjectMetadataId,
          predicates: [
            {
              fieldMetadataId: opportunityNameFieldMetadataId,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value: 'Story 73 Permitted',
            },
          ],
          predicateGroups: [],
        },
      });

      await updateWorkspaceMemberRole({
        client,
        roleId: restrictedRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      for (const opportunity of [
        {
          id: permittedRecentOpportunityId,
          name: permittedRecentOpportunityName,
          createdAt: '2025-02-10T08:00:00.000Z',
        },
        {
          id: permittedOldOpportunityId,
          name: permittedOldOpportunityName,
          createdAt: '2024-12-01T08:00:00.000Z',
        },
        {
          id: deniedRecentOpportunityId,
          name: deniedRecentOpportunityName,
          createdAt: '2025-02-10T08:00:00.000Z',
        },
      ]) {
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'opportunity',
            gqlFields: 'id',
            data: {
              id: opportunity.id,
              stage: 'NEW',
              name: opportunity.name,
              amount: { amountMicros: 1000000 },
              companyId: testCompanyId,
              createdAt: opportunity.createdAt,
              closeDate: '2025-03-01T08:00:00.000Z',
            },
          }),
        );
      }
    });

    afterAll(async () => {
      for (const recordId of [
        permittedRecentOpportunityId,
        permittedOldOpportunityId,
        deniedRecentOpportunityId,
      ]) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'opportunity',
            gqlFields: 'id',
            recordId,
          }),
        );
      }

      if (originalMemberRoleId) {
        await updateWorkspaceMemberRole({
          client,
          roleId: originalMemberRoleId,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        });
      }

      if (restrictedRoleId) {
        await deleteRole(client, restrictedRoleId);
      }

      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED,
        value: false,
        expectToFail: false,
      });
    });

    it('should exclude records outside row-level permission scope when dashboard filters exceed permissions', async () => {
      const response = await getBarChartDataAsMember({
        dashboardFilters: [
          {
            fieldMetadataId: opportunityStageFieldMetadataId,
            operand: ViewFilterOperand.IS,
            value: 'NEW',
          },
        ],
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data?.barChartData.data).toEqual([
        expect.objectContaining({
          [response.body.data.barChartData.indexBy]:
            permittedRecentOpportunityName,
        }),
        expect.objectContaining({
          [response.body.data.barChartData.indexBy]:
            permittedOldOpportunityName,
        }),
      ]);
      expect(response.body.data?.barChartData.data).toHaveLength(2);
      expect(
        response.body.data?.barChartData.data.some(
          (entry: Record<string, string>) =>
            Object.values(entry).includes(deniedRecentOpportunityName),
        ),
      ).toBe(false);
    });

    it('should enforce row-level permission predicates over preset-like dashboard filter values', async () => {
      const response = await getBarChartDataAsMember({
        dashboardFilters: [
          {
            fieldMetadataId: opportunityNameFieldMetadataId,
            operand: ViewFilterOperand.CONTAINS,
            value: 'Story 73',
          },
        ],
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data?.barChartData.data).toHaveLength(2);
      expect(
        response.body.data?.barChartData.data.every(
          (entry: Record<string, string>) =>
            String(entry[response.body.data.barChartData.indexBy]).includes(
              'Story 73 Permitted',
            ),
        ),
      ).toBe(true);
    });

    it('should intersect widget-local and dashboard-global filters before row-level permissions are applied', async () => {
      const response = await getBarChartDataAsMember({
        filter: {
          recordFilters: [
            {
              fieldMetadataId: opportunityCreatedAtFieldMetadataId,
              operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
              value: '2025-01-01T00:00:00.000Z',
            },
          ],
          recordFilterGroups: [],
        },
        dashboardFilters: [
          {
            fieldMetadataId: opportunityStageFieldMetadataId,
            operand: ViewFilterOperand.IS,
            value: 'NEW',
          },
        ],
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data?.barChartData.data).toHaveLength(1);
      expect(response.body.data?.barChartData.data[0]).toEqual(
        expect.objectContaining({
          [response.body.data.barChartData.indexBy]:
            permittedRecentOpportunityName,
        }),
      );
    });
  });
});
