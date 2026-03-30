import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { renderHook } from '@testing-library/react';
import { AggregateOperations, WidgetConfigurationType } from '~/generated-metadata/graphql';

const mockComputeRecordGqlOperationFilter = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({
    objectMetadataItem: {
      fields: [{ id: 'field-1', name: 'amount' }],
      readableFields: [{ id: 'field-1', name: 'amount', type: 'NUMBER' }],
    },
  }),
}));
jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => ({
    userTimezone: 'Europe/London',
  }),
}));
jest.mock('twenty-shared/utils', () => ({
  computeRecordGqlOperationFilter: (...args: unknown[]) =>
    mockComputeRecordGqlOperationFilter(...args),
  isDefined: (value: unknown) => value !== undefined && value !== null,
}));

describe('useGraphWidgetQueryCommon', () => {
  it('should keep widget filters unchanged and expose dashboard filters separately', () => {
    const dashboardFilters = {
      ownerId: 'sales-team',
      dateRange: null,
      stageId: null,
    };

    mockComputeRecordGqlOperationFilter.mockReturnValue({
      amount: { gte: 1 },
    });

    const { result } = renderHook(() =>
      useGraphWidgetQueryCommon({
        objectMetadataItemId: 'object-1',
        dashboardFilters,
        configuration: {
          configurationType: WidgetConfigurationType.AGGREGATE_CHART,
          aggregateOperation: AggregateOperations.COUNT,
          aggregateFieldMetadataId: 'field-1',
          filter: {
            recordFilters: [{ id: 'widget-filter' }],
            recordFilterGroups: [{ id: 'widget-group' }],
          },
        },
      }),
    );

    expect(mockComputeRecordGqlOperationFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        recordFilters: [{ id: 'widget-filter' }],
        recordFilterGroups: [{ id: 'widget-group' }],
      }),
    );
    expect(result.current.gqlOperationFilter).toEqual({
      amount: { gte: 1 },
    });
    expect(result.current.dashboardFilters).toEqual(dashboardFilters);
  });
});
