/* eslint-disable @nx/enforce-module-boundaries */
import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { fetchTestFieldMetadataIds } from 'test/integration/metadata/suites/page-layout-widget/utils/fetch-test-field-metadata-ids.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { AggregateOperations, ViewFilterOperand } from 'twenty-shared/types';

import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

describe('Chart data dashboard filters', () => {
  const testCompanyId = randomUUID();
  const screeningOpportunityId = randomUUID();
  const newOpportunityId = randomUUID();

  let opportunityObjectMetadataId: string;
  let opportunityStageFieldMetadataId: string;
  let opportunityAmountFieldMetadataId: string;
  let companyNameFieldMetadataId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 100 },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });

    const opportunityObject = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'opportunity',
    );
    const companyObject = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'company',
    );

    if (!opportunityObject?.fieldsList || !companyObject?.fieldsList) {
      throw new Error(
        'Expected opportunity and company metadata in test setup',
      );
    }

    opportunityObjectMetadataId = opportunityObject.id;
    opportunityStageFieldMetadataId = opportunityObject.fieldsList.find(
      (field) => field.name === 'stage',
    )!.id;
    opportunityAmountFieldMetadataId = opportunityObject.fieldsList.find(
      (field) => field.name === 'amount',
    )!.id;
    companyNameFieldMetadataId = companyObject.fieldsList.find(
      (field) => field.name === 'name',
    )!.id;

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        data: {
          id: testCompanyId,
          name: 'Chart Filter Company',
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id',
        data: {
          id: screeningOpportunityId,
          stage: 'SCREENING',
          name: 'Screening Opportunity',
          amount: { amountMicros: 1000000 },
          companyId: testCompanyId,
          createdAt: '2020-02-05T08:00:00.000Z',
          closeDate: '2025-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id',
        data: {
          id: newOpportunityId,
          stage: 'NEW',
          name: 'New Opportunity',
          amount: { amountMicros: 2000000 },
          companyId: testCompanyId,
          createdAt: '2020-02-05T08:00:00.000Z',
          closeDate: '2025-02-06T08:00:00.000Z',
        },
      }),
    );
  });

  afterAll(async () => {
    for (const recordId of [screeningOpportunityId, newOpportunityId]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'opportunity',
          gqlFields: 'id',
          recordId,
        }),
      );
    }

    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: testCompanyId,
      }),
    );
  });

  it('should accept dashboardFilters in barChartData input', async () => {
    const { objectMetadataId, fieldMetadataId1, fieldMetadataId2 } =
      await fetchTestFieldMetadataIds();

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

  it('should apply dashboard and widget filters with AND semantics', async () => {
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
          objectMetadataId: opportunityObjectMetadataId,
          configuration: {
            configurationType: WidgetConfigurationType.BAR_CHART,
            aggregateFieldMetadataId: opportunityAmountFieldMetadataId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: opportunityStageFieldMetadataId,
            layout: BarChartLayout.VERTICAL,
            groupMode: BarChartGroupMode.GROUPED,
            filter: {
              recordFilters: [
                {
                  fieldMetadataId: opportunityStageFieldMetadataId,
                  operand: ViewFilterOperand.IS,
                  value: 'SCREENING',
                },
              ],
              recordFilterGroups: [],
            },
          },
          dashboardFilters: [
            {
              fieldMetadataId: opportunityStageFieldMetadataId,
              operand: ViewFilterOperand.IS,
              value: 'NEW',
            },
          ],
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.barChartData.data).toEqual([]);
  });

  it('should ignore dashboard filters that do not apply to the widget object while keeping applicable ones', async () => {
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
          objectMetadataId: opportunityObjectMetadataId,
          configuration: {
            configurationType: WidgetConfigurationType.BAR_CHART,
            aggregateFieldMetadataId: opportunityAmountFieldMetadataId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: opportunityStageFieldMetadataId,
            layout: BarChartLayout.VERTICAL,
            groupMode: BarChartGroupMode.GROUPED,
            filter: {
              recordFilters: [
                {
                  fieldMetadataId: opportunityStageFieldMetadataId,
                  operand: ViewFilterOperand.IS,
                  value: 'SCREENING',
                },
              ],
              recordFilterGroups: [],
            },
          },
          dashboardFilters: [
            {
              fieldMetadataId: companyNameFieldMetadataId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'Chart Filter Company',
            },
            {
              fieldMetadataId: opportunityStageFieldMetadataId,
              operand: ViewFilterOperand.IS,
              value: 'NEW',
            },
          ],
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.barChartData.data).toEqual([]);
  });
});
