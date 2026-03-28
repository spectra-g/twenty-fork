import { renderHook } from '@testing-library/react';

import { ViewFilterOperand } from 'twenty-shared/types';

import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { useGraphLineChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useGraphLineChartWidgetData';
import { useGraphPieChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/useGraphPieChartWidgetData';

const mockUseDashboardFilters = jest.fn();
const mockUseQuery = jest.fn();

jest.mock('@/dashboard-filters/hooks/useDashboardFilters', () => ({
  useDashboardFilters: () => mockUseDashboardFilters(),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({
    objectMetadataItem: {
      fields: [
        { id: 'owner-field-id', name: 'owner', type: 'ACTOR' },
        { id: 'created-at-field-id', name: 'createdAt', type: 'DATE_TIME' },
        { id: 'stage-field-id', name: 'stage', type: 'SELECT' },
      ],
    },
  }),
}));

jest.mock('@apollo/client', () => ({
  gql: (strings: TemplateStringsArray) => strings[0],
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

jest.mock('@/page-layout/widgets/graph/utils/determineGraphColorMode', () => ({
  determineGraphColorMode: () => 'automaticPalette',
}));

jest.mock('@/page-layout/widgets/graph/utils/parseGraphColor', () => ({
  parseGraphColor: () => undefined,
}));

jest.mock('@/page-layout/widgets/graph/utils/determineChartItemColor', () => ({
  determineChartItemColor: () => undefined,
}));

jest.mock(
  '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getEffectiveGroupMode',
  () => ({
    getEffectiveGroupMode: () => 'grouped',
  }),
);

describe('dashboard filters in graph data hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDashboardFilters.mockReturnValue({
      appliedFilters: {
        ownerId: 'owner-1',
        startDate: '',
        endDate: '',
        stageId: '',
      },
    });
    mockUseQuery.mockReturnValue({
      data: undefined,
      previousData: undefined,
      loading: false,
      error: undefined,
    });
  });

  it('passes applied dashboard filters to the bar chart query configuration', () => {
    renderHook(() =>
      useGraphBarChartWidgetData({
        objectMetadataItemId: 'object-id',
        configuration: {
          aggregateFieldMetadataId: 'aggregate-field-id',
          primaryAxisGroupByFieldMetadataId: 'created-at-field-id',
          filter: {
            recordFilters: [
              {
                fieldMetadataId: 'widget-field-id',
                operand: 'IS',
                value: 'widget',
              },
            ],
          },
        } as never,
      }),
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: {
          input: {
            objectMetadataId: 'object-id',
            configuration: expect.objectContaining({
              filter: expect.objectContaining({
                recordFilters: expect.arrayContaining([
                  expect.objectContaining({
                    fieldMetadataId: 'widget-field-id',
                    operand: 'IS',
                    value: 'widget',
                  }),
                  expect.objectContaining({
                    fieldMetadataId: 'owner-field-id',
                    operand: ViewFilterOperand.IS,
                    subFieldName: 'workspaceMemberId',
                  }),
                ]),
              }),
            }),
          },
        },
      }),
    );
  });

  it('passes applied dashboard filters to the line chart query configuration', () => {
    renderHook(() =>
      useGraphLineChartWidgetData({
        objectMetadataItemId: 'object-id',
        configuration: {
          aggregateFieldMetadataId: 'aggregate-field-id',
          filter: {
            recordFilters: [
              {
                fieldMetadataId: 'widget-field-id',
                operand: 'IS',
                value: 'widget',
              },
            ],
          },
        } as never,
      }),
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: {
          input: {
            objectMetadataId: 'object-id',
            configuration: expect.objectContaining({
              filter: expect.objectContaining({
                recordFilters: expect.arrayContaining([
                  expect.objectContaining({
                    fieldMetadataId: 'widget-field-id',
                    operand: 'IS',
                    value: 'widget',
                  }),
                  expect.objectContaining({
                    fieldMetadataId: 'owner-field-id',
                  }),
                ]),
              }),
            }),
          },
        },
      }),
    );
  });

  it('passes applied dashboard filters to the pie chart query configuration', () => {
    renderHook(() =>
      useGraphPieChartWidgetData({
        objectMetadataItemId: 'object-id',
        configuration: {
          aggregateFieldMetadataId: 'aggregate-field-id',
          groupByFieldMetadataId: 'stage-field-id',
          filter: {
            recordFilters: [
              {
                fieldMetadataId: 'widget-field-id',
                operand: 'IS',
                value: 'widget',
              },
            ],
          },
        } as never,
      }),
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: {
          input: {
            objectMetadataId: 'object-id',
            configuration: expect.objectContaining({
              filter: expect.objectContaining({
                recordFilters: expect.arrayContaining([
                  expect.objectContaining({
                    fieldMetadataId: 'widget-field-id',
                    operand: 'IS',
                    value: 'widget',
                  }),
                  expect.objectContaining({
                    fieldMetadataId: 'owner-field-id',
                  }),
                ]),
              }),
            }),
          },
        },
      }),
    );
  });

  it('gives precedence to the dashboard filter when bar chart filters conflict on the same field', () => {
    renderHook(() =>
      useGraphBarChartWidgetData({
        objectMetadataItemId: 'object-id',
        configuration: {
          aggregateFieldMetadataId: 'aggregate-field-id',
          primaryAxisGroupByFieldMetadataId: 'created-at-field-id',
          filter: {
            recordFilters: [
              {
                fieldMetadataId: 'owner-field-id',
                operand: 'IS',
                value: 'owner-2',
              },
            ],
          },
        } as never,
      }),
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: {
          input: expect.objectContaining({
            configuration: expect.objectContaining({
              filter: expect.objectContaining({
                recordFilters: expect.arrayContaining([
                  expect.objectContaining({
                    fieldMetadataId: 'owner-field-id',
                    value: expect.stringContaining('owner-1'),
                  }),
                ]),
              }),
            }),
          }),
        },
      }),
    );
  });
});
