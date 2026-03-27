import gql from 'graphql-tag';
import { fetchTestFieldMetadataIds } from 'test/integration/metadata/suites/page-layout-widget/utils/fetch-test-field-metadata-ids.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { AggregateOperations, ViewFilterOperand } from 'twenty-shared/types';

import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

describe('Chart data dashboard filters', () => {
  it('should accept dashboardFilters in barChartData input', async () => {
    const {
      objectMetadataId,
      fieldMetadataId1,
      fieldMetadataId2,
    } = await fetchTestFieldMetadataIds();

    const response = await makeGraphqlAPIRequest({
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
          objectMetadataId,
          configuration: {
            configurationType: WidgetConfigurationType.BAR_CHART,
            aggregateFieldMetadataId: fieldMetadataId1,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: fieldMetadataId2,
            layout: BarChartLayout.VERTICAL,
            groupMode: BarChartGroupMode.GROUPED,
          },
          dashboardFilters: [
            {
              fieldMetadataId: fieldMetadataId2,
              operand: ViewFilterOperand.CONTAINS,
              value: 'Acme',
            },
          ],
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.barChartData).toBeDefined();
  });
});
