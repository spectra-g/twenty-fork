import gql from 'graphql-tag';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
  type GraphQLResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';

type DashboardPreset = {
  id: string;
  name: string;
  lastUsedAt: string;
  filterState: {
    recordFilters?: Array<Record<string, unknown>>;
    recordFilterGroups?: Array<Record<string, unknown>>;
  } | null;
};

type DashboardFiltersAndPresetsResponse = {
  dashboardFiltersAndPresets: {
    activeFilterState: DashboardPreset['filterState'];
    presets: DashboardPreset[];
  };
};

type SaveDashboardPresetResponse = {
  saveDashboardPreset: {
    success: boolean;
    preset: DashboardPreset;
  };
};

const findDashboardFiltersAndPresets = async (dashboardId: string) => {
  return (await makeGraphqlAPIRequest({
    query: gql`
      query DashboardFiltersAndPresets($dashboardId: UUID!) {
        dashboardFiltersAndPresets(dashboardId: $dashboardId) {
          activeFilterState
          presets {
            id
            name
            filterState
            lastUsedAt
          }
        }
      }
    `,
    variables: {
      dashboardId,
    },
  })) as GraphQLResponse<DashboardFiltersAndPresetsResponse>;
};

const saveDashboardPreset = async ({
  dashboardId,
  name,
  filterState,
}: {
  dashboardId: string;
  name: string;
  filterState: Record<string, unknown> | null;
}) => {
  return (await makeGraphqlAPIRequest({
    query: gql`
      mutation SaveDashboardPreset(
        $dashboardId: UUID!
        $name: String!
        $filterState: JSON
      ) {
        saveDashboardPreset(
          dashboardId: $dashboardId
          name: $name
          filterState: $filterState
        ) {
          success
          preset {
            id
            name
            filterState
            lastUsedAt
          }
        }
      }
    `,
    variables: {
      dashboardId,
      name,
      filterState,
    },
  })) as GraphQLResponse<SaveDashboardPresetResponse>;
};

type TouchDashboardPresetResponse = {
  touchDashboardPreset: {
    success: boolean;
    preset: DashboardPreset;
  };
};

const touchDashboardPreset = async (presetId: string) => {
  return (await makeGraphqlAPIRequest({
    query: gql`
      mutation TouchDashboardPreset($presetId: UUID!) {
        touchDashboardPreset(presetId: $presetId) {
          success
          preset {
            id
            name
            filterState
            lastUsedAt
          }
        }
      }
    `,
    variables: {
      presetId,
    },
  })) as GraphQLResponse<TouchDashboardPresetResponse>;
};

describe('Dashboard preset resolver', () => {
  let dashboardId: string;

  beforeEach(async () => {
    const dashboard = await createTestDashboardWithGraphQL({
      title: 'Dashboard Preset Integration Test',
    });

    dashboardId = dashboard.id;
  });

  afterEach(async () => {
    await destroyDashboardWithGraphQL(dashboardId);
  });

  it('should return empty presets and null active filter state for a dashboard', async () => {
    const response = await findDashboardFiltersAndPresets(dashboardId);

    assertGraphQLSuccessfulResponse(response);
    expect(response.body.data?.dashboardFiltersAndPresets).toEqual({
      activeFilterState: null,
      presets: [],
    });
  });

  it('should save a dashboard preset and return success with the preset payload', async () => {
    const filterState = {
      recordFilters: [
        {
          fieldMetadataId: 'company-id',
          operand: 'contains',
          value: 'Acme',
        },
      ],
      recordFilterGroups: [
        {
          id: 'group-1',
          logicalOperator: 'AND',
        },
      ],
    };

    const response = await saveDashboardPreset({
      dashboardId,
      name: 'My Pipeline Preset',
      filterState,
    });

    assertGraphQLSuccessfulResponse(response);
    expect(response.body.data?.saveDashboardPreset).toMatchObject({
      success: true,
      preset: {
        name: 'My Pipeline Preset',
        filterState,
        lastUsedAt: expect.any(String),
      },
    });

    const presetsResponse = await findDashboardFiltersAndPresets(dashboardId);

    assertGraphQLSuccessfulResponse(presetsResponse);
    expect(presetsResponse.body.data?.dashboardFiltersAndPresets).toEqual({
      activeFilterState: null,
      presets: [
        expect.objectContaining({
          id: response.body.data?.saveDashboardPreset.preset.id,
          name: 'My Pipeline Preset',
          filterState,
          lastUsedAt: expect.any(String),
        }),
      ],
    });
  });

  it('should reject an empty filter state payload', async () => {
    const response = await saveDashboardPreset({
      dashboardId,
      name: 'Invalid Preset',
      filterState: null,
    });

    assertGraphQLErrorResponse(
      response,
      ErrorCode.BAD_USER_INPUT,
      'Filter state is required',
    );
  });

  it('should return presets ordered by most recently used after an explicit touch', async () => {
    const firstResponse = await saveDashboardPreset({
      dashboardId,
      name: 'Preset A',
      filterState: {
        recordFilters: [
          {
            fieldMetadataId: 'company-id',
            operand: 'contains',
            value: 'Acme',
          },
        ],
      },
    });
    const secondResponse = await saveDashboardPreset({
      dashboardId,
      name: 'Preset B',
      filterState: {
        recordFilters: [
          {
            fieldMetadataId: 'company-id',
            operand: 'contains',
            value: 'Globex',
          },
        ],
      },
    });
    const thirdResponse = await saveDashboardPreset({
      dashboardId,
      name: 'Preset C',
      filterState: {
        recordFilters: [
          {
            fieldMetadataId: 'company-id',
            operand: 'contains',
            value: 'Initech',
          },
        ],
      },
    });

    assertGraphQLSuccessfulResponse(firstResponse);
    assertGraphQLSuccessfulResponse(secondResponse);
    assertGraphQLSuccessfulResponse(thirdResponse);

    const secondPresetId =
      secondResponse.body.data?.saveDashboardPreset.preset.id;
    const firstPresetId =
      firstResponse.body.data?.saveDashboardPreset.preset.id;
    const thirdPresetId =
      thirdResponse.body.data?.saveDashboardPreset.preset.id;

    if (!secondPresetId || !firstPresetId || !thirdPresetId) {
      throw new Error('Expected dashboard preset identifiers to be returned');
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
    const touchSecondResponse = await touchDashboardPreset(secondPresetId);
    await new Promise((resolve) => setTimeout(resolve, 10));
    const touchFirstResponse = await touchDashboardPreset(firstPresetId);
    await new Promise((resolve) => setTimeout(resolve, 10));
    const touchThirdResponse = await touchDashboardPreset(thirdPresetId);

    assertGraphQLSuccessfulResponse(touchSecondResponse);
    assertGraphQLSuccessfulResponse(touchFirstResponse);
    assertGraphQLSuccessfulResponse(touchThirdResponse);

    expect(touchThirdResponse.body.data?.touchDashboardPreset).toMatchObject({
      success: true,
      preset: {
        id: thirdPresetId,
        name: 'Preset C',
        lastUsedAt: expect.any(String),
      },
    });

    const response = await findDashboardFiltersAndPresets(dashboardId);

    assertGraphQLSuccessfulResponse(response);
    expect(
      response.body.data?.dashboardFiltersAndPresets.presets.map(
        (preset) => preset.name,
      ),
    ).toEqual(['Preset C', 'Preset A', 'Preset B']);
  });
});
