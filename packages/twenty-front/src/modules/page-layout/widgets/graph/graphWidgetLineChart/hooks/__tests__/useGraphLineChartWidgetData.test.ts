import { useGraphLineChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useGraphLineChartWidgetData';
import { renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client';

const mockUseObjectMetadataItemById = jest.fn();
const mockUseDashboardFilterState = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: (...args: unknown[]) =>
    mockUseObjectMetadataItemById(...args),
}));

jest.mock('@/dashboard/hooks/useDashboardFilterState', () => {
  const actual = jest.requireActual('@/dashboard/hooks/useDashboardFilterState');

  return {
    ...actual,
    useDashboardFilterState: () => mockUseDashboardFilterState(),
  };
});

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
}));

describe('useGraphLineChartWidgetData', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseObjectMetadataItemById.mockReturnValue({
      objectMetadataItem: {
        fields: [],
      },
    });

    mockUseDashboardFilterState.mockReturnValue({
      filters: {
        owner: 'John',
        dateRange: 'LAST_30_DAYS',
        stage: 'Won',
      },
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: {
        lineChartData: {
          series: [],
          formattedToRawLookup: {},
        },
      },
      loading: false,
      error: undefined,
    });
  });

  it('passes dashboard filters in chart query variables', () => {
    renderHook(() =>
      useGraphLineChartWidgetData({
        objectMetadataItemId: 'object-id',
        configuration: {
          aggregateFieldMetadataId: 'aggregate-field',
          primaryAxisGroupByFieldMetadataId: 'group-by-field',
          filter: {
            recordFilters: [],
            recordFilterGroups: [],
          },
        } as any,
      }),
    );

    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: expect.objectContaining({
          input: expect.objectContaining({
            configuration: expect.objectContaining({
              filter: expect.objectContaining({
                recordFilters: expect.arrayContaining([
                  expect.objectContaining({ value: 'John' }),
                  expect.objectContaining({ value: 'LAST_30_DAYS' }),
                  expect.objectContaining({ value: 'Won' }),
                ]),
              }),
            }),
          }),
        }),
      }),
    );
  });
});
