// Integration acceptance: requires the local GraphQL server and database stack to be running.
import { gql } from '@apollo/client';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

const dashboardId = 'dc0af4f7-a5c0-4be4-82ae-e39ed13c3a5d';
const readOnlyDashboardAccessToken = 'readonly-dashboard-access-token';

const buildFilter = (value: string) => ({
  recordFilters: [
    {
      fieldMetadataId: 'status-field-id',
      operand: ViewFilterOperand.IS,
      type: FieldMetadataType.SELECT,
      value,
    },
  ],
  recordFilterGroups: [],
});

describe.skip('Dashboard preset GraphQL permissions', () => {
  it('AC-002 denies preset mutations when the caller lacks dashboard edit permission', async () => {
    const createResponse = await makeGraphqlAPIRequest(
      {
        query: gql`
          mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
            createDashboardPreset(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            dashboardId,
            name: 'Read-only preset',
            filter: buildFilter('OPEN'),
          },
        },
      },
      readOnlyDashboardAccessToken,
    );

    expect(createResponse.body.data).toBeNull();
    expect(createResponse.body.errors?.[0].extensions.code).toBe(
      'PERMISSION_DENIED',
    );

    const updateResponse = await makeGraphqlAPIRequest(
      {
        query: gql`
          mutation UpdateDashboardPreset($input: UpdateDashboardPresetInput!) {
            updateDashboardPreset(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: 'dashboard-preset-id',
            name: 'Read-only preset',
            filter: buildFilter('WON'),
          },
        },
      },
      readOnlyDashboardAccessToken,
    );

    expect(updateResponse.body.data).toBeNull();
    expect(updateResponse.body.errors?.[0].extensions.code).toBe(
      'PERMISSION_DENIED',
    );

    const deleteResponse = await makeGraphqlAPIRequest(
      {
        query: gql`
          mutation DeleteDashboardPreset($id: UUID!) {
            deleteDashboardPreset(id: $id)
          }
        `,
        variables: {
          id: 'dashboard-preset-id',
        },
      },
      readOnlyDashboardAccessToken,
    );

    expect(deleteResponse.body.data).toBeNull();
    expect(deleteResponse.body.errors?.[0].extensions.code).toBe(
      'PERMISSION_DENIED',
    );
  });
});
