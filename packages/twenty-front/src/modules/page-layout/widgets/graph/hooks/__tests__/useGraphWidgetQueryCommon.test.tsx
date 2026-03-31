import { renderHook } from '@testing-library/react';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { DashboardWidgetFiltersProvider } from '@/page-layout/widgets/states/contexts/DashboardWidgetFiltersContext';
import { type DashboardWidgetFilter } from '@/page-layout/widgets/utils/mergeWidgetFilters';

const computeRecordGqlOperationFilterMock = jest.fn(() => ({}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({
    objectMetadataItem: {
      fields: [
        {
          id: 'aggregate-field-id',
          name: 'amount',
          type: FieldMetadataType.NUMBER,
        },
      ],
      readableFields: [
        {
          id: 'aggregate-field-id',
          name: 'amount',
          type: FieldMetadataType.NUMBER,
        },
      ],
    },
  }),
}));

jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => ({
    userTimezone: 'UTC',
  }),
}));

jest.mock('twenty-shared/utils', () => ({
  ...jest.requireActual('twenty-shared/utils'),
  computeRecordGqlOperationFilter: (args: unknown) =>
    computeRecordGqlOperationFilterMock(args),
}));

describe('useGraphWidgetQueryCommon', () => {
  it('merges compatible dashboard filters with widget filters before building the gql filter', () => {
    const dashboardFilters: DashboardWidgetFilter[] = [
      {
        dimension: 'owner',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'created-by-field',
              operand: ViewFilterOperand.IS,
              value: '["owner-1"]',
              subFieldName: 'workspaceMemberId',
            },
          ],
        },
      },
    ];

    renderHook(
      () =>
        useGraphWidgetQueryCommon({
          objectMetadataItemId: 'object-id',
          widgetType: WidgetType.GRAPH,
          configuration: {
            aggregateFieldMetadataId: 'aggregate-field-id',
            aggregateOperation: 'COUNT',
            configurationType: 'AGGREGATE_CHART',
            filter: {
              recordFilters: [
                {
                  fieldMetadataId: 'stage-field',
                  operand: ViewFilterOperand.IS,
                  value: 'PROPOSAL',
                },
              ],
            },
          } as any,
        }),
      {
        wrapper: ({ children }) => (
          <DashboardWidgetFiltersProvider dashboardFilters={dashboardFilters}>
            {children}
          </DashboardWidgetFiltersProvider>
        ),
      },
    );

    expect(computeRecordGqlOperationFilterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        recordFilters: [
          {
            fieldMetadataId: 'stage-field',
            operand: ViewFilterOperand.IS,
            value: 'PROPOSAL',
          },
          {
            fieldMetadataId: 'created-by-field',
            operand: ViewFilterOperand.IS,
            value: '["owner-1"]',
            subFieldName: 'workspaceMemberId',
          },
        ],
        recordFilterGroups: [],
      }),
    );
  });
});
