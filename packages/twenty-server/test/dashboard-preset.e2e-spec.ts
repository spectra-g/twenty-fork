// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import gql from 'graphql-tag';
import { type GraphQLResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
  findDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';

type DashboardPresetGraphqlShape = {
  id: string;
  dashboardId: string;
  name: string;
  filterState: Record<string, unknown>;
};

type CreateDashboardPresetResponse = {
  createDashboardPreset: DashboardPresetGraphqlShape;
};

type ListDashboardPresetsResponse = {
  listDashboardPresets: DashboardPresetGraphqlShape[];
};

type ApplyDashboardPresetResponse = {
  applyDashboardPreset: {
    dashboardId: string;
    filterConfiguration: Record<string, unknown>;
  };
};

describe.skip('Dashboard preset acceptance', () => {
  const createdDashboardIds: string[] = [];

  afterEach(async () => {
    await Promise.all(
      createdDashboardIds
        .splice(0)
        .map((dashboardId) => destroyDashboardWithGraphQL(dashboardId)),
    );
  });

  it('AC-001: creates a dashboard preset with persisted filter state', async () => {
    const dashboard = await createTestDashboardWithGraphQL({
      title: 'Preset Source Dashboard',
      position: 0,
    });

    createdDashboardIds.push(dashboard.id);

    const filterState = {
      recordFilters: [
        {
          id: 'status-open',
          fieldMetadataId: 'field-status',
          operand: 'is',
          value: 'OPEN',
        },
      ],
      recordFilterGroups: [],
    };

    const response = (await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
            dashboardId
            name
            filterState
          }
        }
      `,
      variables: {
        input: {
          dashboardId: dashboard.id,
          name: 'Q1 Sales View',
          filterState,
        },
      },
    })) as GraphQLResponse<CreateDashboardPresetResponse>;

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.createDashboardPreset).toMatchObject({
      dashboardId: dashboard.id,
      name: 'Q1 Sales View',
      filterState,
    });
    expect(response.body.data?.createDashboardPreset.id).toBeTruthy();
  });

  it('AC-002: lists presets scoped to the requested dashboard', async () => {
    const dashboardA = await createTestDashboardWithGraphQL({
      title: 'Dashboard A',
      position: 0,
    });
    const dashboardB = await createTestDashboardWithGraphQL({
      title: 'Dashboard B',
      position: 1,
    });

    createdDashboardIds.push(dashboardA.id, dashboardB.id);

    const createPreset = (dashboardId: string, name: string, value: string) =>
      makeGraphqlAPIRequest({
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
            name,
            filterState: {
              recordFilters: [
                {
                  id: `${name}-filter`,
                  fieldMetadataId: 'field-status',
                  operand: 'is',
                  value,
                },
              ],
              recordFilterGroups: [],
            },
          },
        },
      });

    await createPreset(dashboardA.id, 'A-1', 'OPEN');
    await createPreset(dashboardA.id, 'A-2', 'CLOSED');
    await createPreset(dashboardB.id, 'B-1', 'WON');

    const dashboardAResponse = (await makeGraphqlAPIRequest({
      query: gql`
        query ListDashboardPresets($dashboardId: String!) {
          listDashboardPresets(dashboardId: $dashboardId) {
            id
            dashboardId
            name
            filterState
          }
        }
      `,
      variables: {
        dashboardId: dashboardA.id,
      },
    })) as GraphQLResponse<ListDashboardPresetsResponse>;

    const dashboardBResponse = (await makeGraphqlAPIRequest({
      query: gql`
        query ListDashboardPresets($dashboardId: String!) {
          listDashboardPresets(dashboardId: $dashboardId) {
            id
            dashboardId
            name
            filterState
          }
        }
      `,
      variables: {
        dashboardId: dashboardB.id,
      },
    })) as GraphQLResponse<ListDashboardPresetsResponse>;

    expect(dashboardAResponse.body.errors).toBeUndefined();
    expect(dashboardBResponse.body.errors).toBeUndefined();
    expect(dashboardAResponse.body.data?.listDashboardPresets).toHaveLength(2);
    expect(dashboardBResponse.body.data?.listDashboardPresets).toHaveLength(1);
    expect(
      dashboardAResponse.body.data?.listDashboardPresets.every(
        (preset) => preset.dashboardId === dashboardA.id,
      ),
    ).toBe(true);
    expect(
      dashboardBResponse.body.data?.listDashboardPresets[0].dashboardId,
    ).toBe(dashboardB.id);
  });

  it('AC-003: applies a preset to the dashboard filter configuration', async () => {
    const dashboard = await createTestDashboardWithGraphQL({
      title: 'Apply Preset Dashboard',
      position: 0,
    });

    createdDashboardIds.push(dashboard.id);

    const filterState = {
      recordFilters: [
        {
          id: 'status-open',
          fieldMetadataId: 'field-status',
          operand: 'is',
          value: 'OPEN',
        },
      ],
      recordFilterGroups: [],
    };

    const createPresetResponse = (await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          dashboardId: dashboard.id,
          name: 'Open Only',
          filterState,
        },
      },
    })) as GraphQLResponse<{ createDashboardPreset: { id: string } }>;

    const presetId = createPresetResponse.body.data?.createDashboardPreset.id;

    expect(presetId).toBeTruthy();

    const applyResponse = (await makeGraphqlAPIRequest({
      query: gql`
        mutation ApplyDashboardPreset($input: ApplyDashboardPresetInput!) {
          applyDashboardPreset(input: $input) {
            dashboardId
            filterConfiguration
          }
        }
      `,
      variables: {
        input: {
          presetId,
          targetDashboardId: dashboard.id,
        },
      },
    })) as GraphQLResponse<ApplyDashboardPresetResponse>;

    expect(applyResponse.body.errors).toBeUndefined();
    expect(applyResponse.body.data?.applyDashboardPreset).toEqual({
      dashboardId: dashboard.id,
      filterConfiguration: filterState,
    });

    const updatedDashboard = await findDashboardWithGraphQL(dashboard.id);

    expect(updatedDashboard?.filterConfiguration).toEqual(filterState);
  });
});
