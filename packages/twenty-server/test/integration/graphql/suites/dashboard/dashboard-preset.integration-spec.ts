/* eslint-disable @nx/enforce-module-boundaries */
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
  it('createDashboardPreset mutation rejects an unknown dashboard id', async () => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          dashboardId: '11111111-1111-4111-8111-111111111111',
          name: 'Unknown dashboard',
          filter: buildFilter('OPEN'),
        },
      },
    });

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors?.[0].message).toContain('Dashboard');
    expect(response.body.errors?.[0].message).toContain('not found');
  });

  it('dashboardPresets query rejects an unknown dashboard id', async () => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        query DashboardPresets($dashboardId: UUID!) {
          dashboardPresets(dashboardId: $dashboardId) {
            id
          }
        }
      `,
      variables: {
        dashboardId: '11111111-1111-4111-8111-111111111111',
      },
    });

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors?.[0].message).toContain('Dashboard');
    expect(response.body.errors?.[0].message).toContain('not found');
  });

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

  it('createDashboardPreset mutation rejects an invalid filter payload', async () => {
    const response = await makeGraphqlAPIRequest({
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
          name: 'Invalid filter',
          filter: {
            recordFilters: 'not-an-array',
            recordFilterGroups: [],
          },
        },
      },
    });

    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors?.[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(response.body.errors?.[0].message).toContain(
      'filter must be a valid chart filter payload',
    );
  });

  it('createDashboardPreset mutation rejects duplicate names on the same dashboard', async () => {
    const duplicateDashboardId = '6d0cbf48-235a-4db8-b7a7-a04361739997';

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
          dashboardId: duplicateDashboardId,
          name: 'Quarterly pipeline',
          filter: buildFilter('OPEN'),
        },
      },
    });

    const response = await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          dashboardId: duplicateDashboardId,
          name: 'Quarterly pipeline',
          filter: buildFilter('WON'),
        },
      },
    });

    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors?.[0].extensions.code).toBe('CONFLICT');
    expect(response.body.errors?.[0].message).toContain(
      'already exists for dashboard',
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

  it('dashboardPreset query returns a preset by id across requests', async () => {
    const createResponse = await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
            filter
          }
        }
      `,
      variables: {
        input: {
          dashboardId,
          name: 'Reloaded preset',
          filter: buildFilter('REOPENED'),
        },
      },
    });

    const presetId = createResponse.body.data.createDashboardPreset.id;

    const response = await makeGraphqlAPIRequest({
      query: gql`
        query DashboardPreset($id: UUID!) {
          dashboardPreset(id: $id) {
            id
            name
            dashboardId
            filter
          }
        }
      `,
      variables: {
        id: presetId,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.dashboardPreset).toEqual(
      expect.objectContaining({
        id: presetId,
        name: 'Reloaded preset',
        dashboardId,
        filter: buildFilter('REOPENED'),
      }),
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

  it('updateDashboardPreset mutation rejects duplicate names on the same dashboard', async () => {
    const duplicateDashboardId = 'e1855202-dfd7-4904-bb0e-6fe3f4a8f578';

    const firstCreateResponse = await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          dashboardId: duplicateDashboardId,
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
          dashboardId: duplicateDashboardId,
          name: 'Won deals',
          filter: buildFilter('WON'),
        },
      },
    });

    const response = await makeGraphqlAPIRequest({
      query: gql`
        mutation UpdateDashboardPreset($input: UpdateDashboardPresetInput!) {
          updateDashboardPreset(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          id: firstCreateResponse.body.data.createDashboardPreset.id,
          name: 'Won deals',
        },
      },
    });

    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors?.[0].extensions.code).toBe('CONFLICT');
    expect(response.body.errors?.[0].message).toContain(
      'already exists for dashboard',
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
