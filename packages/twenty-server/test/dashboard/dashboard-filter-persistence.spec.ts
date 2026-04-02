// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  destroyDashboardWithGraphQL,
  findDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';

describe.skip('Dashboard filter persistence acceptance', () => {
  let dashboardIdToDestroy = '';

  afterEach(async () => {
    if (dashboardIdToDestroy !== '') {
      await destroyDashboardWithGraphQL(dashboardIdToDestroy);
    }

    dashboardIdToDestroy = '';
  });

  it('persists filterBarEnabled and filterConfiguration on a dashboard and returns them via GraphQL', async () => {
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

    const createDashboardOperation = {
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
          title: 'Revenue Dashboard',
          position: 0,
          filterBarEnabled: true,
          filterConfiguration,
        },
      },
    };

    const createDashboardResponse = await makeGraphqlAPIRequest(
      createDashboardOperation,
    );

    dashboardIdToDestroy =
      createDashboardResponse.body.data.createDashboard.id as string;

    const dashboard = await findDashboardWithGraphQL(dashboardIdToDestroy);

    expect(dashboard).toMatchObject({
      id: dashboardIdToDestroy,
      filterBarEnabled: true,
      filterConfiguration,
    });
  });
});
