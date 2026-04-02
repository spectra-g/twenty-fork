// Acceptance: requires live stack — enable in CI or local dev with full environment running.
import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

describe.skip('Dashboard chart filter composition acceptance', () => {
  it('applies global dashboard filters and local widget filters together when querying chart data', async () => {
    const operation = {
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
          objectMetadataId: '20202020-0000-0000-0000-000000000000',
          globalFilters: {
            recordFilters: [
              {
                id: 'global-filter-1',
                fieldMetadataId: 'owner-field-id',
                operand: 'is',
                value: 'me',
              },
            ],
            recordFilterGroups: [],
          },
          configuration: {
            aggregateFieldMetadataId: 'aggregate-field-id',
            aggregateOperation: 'COUNT',
            primaryAxisGroupByFieldMetadataId: 'group-by-field-id',
            layout: 'VERTICAL',
            filter: {
              recordFilters: [
                {
                  id: 'local-filter-1',
                  fieldMetadataId: 'status-field-id',
                  operand: 'is',
                  value: 'OPEN',
                },
              ],
              recordFilterGroups: [],
            },
          },
        },
      },
    };

    const response = await makeGraphqlAPIRequest(operation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.barChartData).toBeDefined();
  });
});
