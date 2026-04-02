import gql from 'graphql-tag';
import { type GraphQLResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { destroyDashboardWithGraphQL } from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';

type DashboardGraphqlShape = {
  id: string;
  filterBarEnabled: boolean;
  filterConfiguration: Record<string, unknown> | null;
};

type CreateDashboardResponse = {
  createDashboard: DashboardGraphqlShape;
};

type FindDashboardResponse = {
  dashboard: DashboardGraphqlShape | null;
};

describe('Dashboard filter state', () => {
  let dashboardIdToDestroy = '';

  afterEach(async () => {
    if (dashboardIdToDestroy !== '') {
      await destroyDashboardWithGraphQL(dashboardIdToDestroy);
    }

    dashboardIdToDestroy = '';
  });

  it('returns persisted filterBarEnabled and filterConfiguration fields', async () => {
    const filterConfiguration = {
      recordFilters: [
        {
          id: 'global-filter-1',
          fieldMetadataId: 'field-status',
          operand: 'is',
          value: 'OPEN',
        },
      ],
      recordFilterGroups: [],
    };

    const createDashboardResponse = (await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboard($input: DashboardCreateInput!) {
          createDashboard(data: $input) {
            id
            filterBarEnabled
            filterConfiguration
          }
        }
      `,
      variables: {
        input: {
          title: 'Pipeline Dashboard',
          position: 0,
          filterBarEnabled: true,
          filterConfiguration,
        },
      },
    })) as GraphQLResponse<CreateDashboardResponse>;

    expect(createDashboardResponse.body.errors).toBeUndefined();

    dashboardIdToDestroy = createDashboardResponse.body.data!.createDashboard.id;

    const findDashboardResponse = (await makeGraphqlAPIRequest({
      query: gql`
        query FindDashboard($filter: DashboardFilterInput!) {
          dashboard(filter: $filter) {
            id
            filterBarEnabled
            filterConfiguration
          }
        }
      `,
      variables: {
        filter: {
          id: {
            eq: dashboardIdToDestroy,
          },
        },
      },
    })) as GraphQLResponse<FindDashboardResponse>;

    expect(findDashboardResponse.body.errors).toBeUndefined();
    expect(findDashboardResponse.body.data?.dashboard).toEqual({
      id: dashboardIdToDestroy,
      filterBarEnabled: true,
      filterConfiguration,
    });
  });

  it('returns disabled defaults when no dashboard filter state is persisted', async () => {
    const createDashboardResponse = (await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateDashboard($input: DashboardCreateInput!) {
          createDashboard(data: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          title: 'Empty Dashboard',
          position: 0,
        },
      },
    })) as GraphQLResponse<CreateDashboardResponse>;

    expect(createDashboardResponse.body.errors).toBeUndefined();

    dashboardIdToDestroy = createDashboardResponse.body.data!.createDashboard.id;

    const findDashboardResponse = (await makeGraphqlAPIRequest({
      query: gql`
        query FindDashboard($filter: DashboardFilterInput!) {
          dashboard(filter: $filter) {
            id
            filterBarEnabled
            filterConfiguration
          }
        }
      `,
      variables: {
        filter: {
          id: {
            eq: dashboardIdToDestroy,
          },
        },
      },
    })) as GraphQLResponse<FindDashboardResponse>;

    expect(findDashboardResponse.body.errors).toBeUndefined();
    expect(findDashboardResponse.body.data?.dashboard).toEqual({
      id: dashboardIdToDestroy,
      filterBarEnabled: false,
      filterConfiguration: null,
    });
  });
});
