import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { usePageLayoutGlobalFilters } from '@/dashboard/hooks/usePageLayoutGlobalFilters';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useQuery } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { AggregateOperations, ViewFilterOperand } from 'twenty-shared/types';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: jest.fn(),
}));

jest.mock('@/dashboard/hooks/usePageLayoutGlobalFilters', () => ({
  usePageLayoutGlobalFilters: jest.fn(),
}));

const mockedUseQuery = jest.mocked(useQuery);
const mockedUseObjectMetadataItemById = jest.mocked(useObjectMetadataItemById);
const mockedUsePageLayoutGlobalFilters = jest.mocked(
  usePageLayoutGlobalFilters,
);

describe('useGraphBarChartWidgetData', () => {
  beforeEach(() => {
    mockedUseObjectMetadataItemById.mockReturnValue({
      objectMetadataItem: {
        fields: [
          { id: 'stage-field-id', type: 'TEXT' },
          { id: 'aggregate-field-id', type: 'NUMBER' },
        ],
        readableFields: [{ id: 'aggregate-field-id' }],
      },
    } as never);

    mockedUsePageLayoutGlobalFilters.mockReturnValue({
      availableFilters: [],
      activeFilters: [],
      setFilterValue: jest.fn(),
      removeFilterValue: jest.fn(),
      clearFilters: jest.fn(),
      presets: [],
      chartDataFilter: {
        recordFilters: [
          {
            fieldMetadataId: 'status-field-id',
            operand: ViewFilterOperand.IS,
            value: 'active',
            type: 'SELECT',
          },
        ],
        recordFilterGroups: [],
      },
    } as never);

    mockedUseQuery.mockReturnValue({
      data: undefined,
      previousData: undefined,
      loading: false,
      error: undefined,
    } as never);
  });

  it('adds dashboard filter context to the bar chart query input', () => {
    renderHook(() =>
      useGraphBarChartWidgetData({
        objectMetadataItemId: 'object-id',
        configuration: {
          configurationType: WidgetConfigurationType.BAR_CHART,
          primaryAxisGroupByFieldMetadataId: 'stage-field-id',
          aggregateFieldMetadataId: 'aggregate-field-id',
          aggregateOperation: AggregateOperations.COUNT,
        } as any,
      }),
    );

    expect(mockedUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: {
          input: expect.objectContaining({
            dashboardRecordFilters: [
              expect.objectContaining({
                fieldMetadataId: 'status-field-id',
                value: 'active',
              }),
            ],
            dashboardRecordFilterGroups: [],
          }),
        },
      }),
    );
  });
});
