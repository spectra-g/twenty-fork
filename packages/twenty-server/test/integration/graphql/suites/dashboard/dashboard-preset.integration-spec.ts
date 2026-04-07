import { gql } from '@apollo/client';

import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

const dashboardId = 'dc0af4f7-a5c0-4be4-82ae-e39ed13c3a5d';
const secondDashboardId = 'd5b8c2b3-e7c5-4656-bec3-8275d182d4d5';

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

describe('Dashboard preset GraphQL contract', () => {
  it('createDashboardPreset mutation returns preset with id', async () => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
            name
            dashboardId
            filter
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          dashboardId,
          name: 'Open deals',
          filter: buildFilter('OPEN'),
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createDashboardPreset).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Open deals',
        dashboardId,
        filter: buildFilter('OPEN'),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it('dashboardPresets query returns list of presets for dashboard', async () => {
    await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          dashboardId: secondDashboardId,
          name: 'Open deals',
          filter: buildFilter('OPEN'),
        },
      },
    });

    await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          dashboardId: secondDashboardId,
          name: 'Won deals',
          filter: buildFilter('WON'),
        },
      },
    });

    const response = await makeGraphqlAPIRequest({
      query: gql`
        query DashboardPresets($dashboardId: UUID!) {
          dashboardPresets(dashboardId: $dashboardId) {
            id
            name
            dashboardId
            filter
          }
        }
      `,
      variables: {
        dashboardId: secondDashboardId,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.dashboardPresets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Open deals',
          dashboardId: secondDashboardId,
          filter: buildFilter('OPEN'),
        }),
        expect.objectContaining({
          name: 'Won deals',
          dashboardId: secondDashboardId,
          filter: buildFilter('WON'),
        }),
      ]),
    );
  });

  it('updateDashboardPreset mutation modifies existing preset', async () => {
    const createResponse = await makeGraphqlAPIRequest({
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
          name: 'Pipeline',
          filter: buildFilter('OPEN'),
        },
      },
    });

    const response = await makeGraphqlAPIRequest({
      query: gql`
        mutation UpdateDashboardPreset($input: UpdateDashboardPresetInput!) {
          updateDashboardPreset(input: $input) {
            id
            name
            dashboardId
            filter
          }
        }
      `,
      variables: {
        input: {
          id: createResponse.body.data.createDashboardPreset.id,
          name: 'Closed pipeline',
          filter: buildFilter('CLOSED'),
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateDashboardPreset).toEqual(
      expect.objectContaining({
        id: createResponse.body.data.createDashboardPreset.id,
        name: 'Closed pipeline',
        dashboardId,
        filter: buildFilter('CLOSED'),
      }),
    );
  });

  it('deleteDashboardPreset mutation removes preset and excludes from list', async () => {
    const isolatedDashboardId = '5179a647-5ac1-4a5b-aa05-594a53db1e04';
    const createResponse = await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          dashboardId: isolatedDashboardId,
          name: 'Delete me',
          filter: buildFilter('OPEN'),
        },
      },
    });

    const presetId = createResponse.body.data.createDashboardPreset.id;

    const deleteResponse = await makeGraphqlAPIRequest({
      query: gql`
        mutation DeleteDashboardPreset($id: UUID!) {
          deleteDashboardPreset(id: $id)
        }
      `,
      variables: {
        id: presetId,
      },
    });

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteDashboardPreset).toBe(true);

    const listResponse = await makeGraphqlAPIRequest({
      query: gql`
        query DashboardPresets($dashboardId: UUID!) {
          dashboardPresets(dashboardId: $dashboardId) {
            id
            name
          }
        }
      `,
      variables: {
        dashboardId: isolatedDashboardId,
      },
    });

    expect(listResponse.body.errors).toBeUndefined();
    expect(listResponse.body.data.dashboardPresets).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: presetId,
          name: 'Delete me',
        }),
      ]),
    );
  });
});
