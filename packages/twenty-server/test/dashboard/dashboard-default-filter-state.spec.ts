// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  destroyDashboardWithGraphQL,
  findDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';

describe.skip('Dashboard default filter state acceptance', () => {
  let dashboardIdToDestroy = '';

  afterEach(async () => {
    if (dashboardIdToDestroy !== '') {
      await destroyDashboardWithGraphQL(dashboardIdToDestroy);
    }

    dashboardIdToDestroy = '';
  });

  it('returns filterBarEnabled false and null filterConfiguration when a dashboard has no persisted filter state', async () => {
    const createDashboardOperation = {
      query: gql`
        mutation CreateDashboard($input: DashboardCreateInput!) {
          createDashboard(data: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          title: 'Default Filters Dashboard',
          position: 0,
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
      filterBarEnabled: false,
      filterConfiguration: null,
    });
  });
});
