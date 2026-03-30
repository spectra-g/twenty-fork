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
        id: 'stub-preset-id',
        name: 'My Pipeline Preset',
        filterState,
      },
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
});
