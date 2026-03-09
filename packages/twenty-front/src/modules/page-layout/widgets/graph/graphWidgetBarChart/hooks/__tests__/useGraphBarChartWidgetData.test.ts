import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { extractBarChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractBarChartDataConfiguration';
import { useEffectiveFilters } from '@/page-layout/hooks/useEffectiveFilters';

jest.mock('@apollo/client', () => ({
  gql: jest.fn(),
  useQuery: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({
    objectMetadataItem: {
      fields: [],
      readableFields: [],
    },
  }),
}));

jest.mock('@/page-layout/widgets/graph/utils/extractBarChartDataConfiguration', () => ({
  extractBarChartDataConfiguration: jest.fn(),
}));

jest.mock('@/page-layout/hooks/useEffectiveFilters', () => ({
  useEffectiveFilters: jest.fn(),
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({
    dashboardFilterState: {
      recordFilters: [],
      recordFilterGroups: [],
    },
  }),
}));

jest.mock('@/page-layout/widgets/graph/utils/parseGraphColor', () => ({
  parseGraphColor: () => undefined,
}));

jest.mock('@/page-layout/widgets/graph/utils/determineGraphColorMode', () => ({
  determineGraphColorMode: () => 'automaticPalette',
}));

describe('useGraphBarChartWidgetData', () => {
  it('uses effective filters in chart query configuration', () => {
    (extractBarChartDataConfiguration as jest.Mock).mockReturnValue({
      filter: {
        recordFilters: [
          {
            id: 'local-stage',
            fieldMetadataId: 'field-stage',
            value: 'Prospecting',
            displayValue: 'Prospecting',
            type: 'TEXT',
            operand: 'IS',
            label: 'Stage',
          },
        ],
        recordFilterGroups: [],
      },
    });

    (useEffectiveFilters as jest.Mock).mockReturnValue({
      recordFilters: [
        {
          id: 'global-stage',
          fieldMetadataId: 'field-stage',
          value: 'Closed Won',
          displayValue: 'Closed Won',
          type: 'TEXT',
          operand: 'IS',
          label: 'Stage',
        },
      ],
      recordFilterGroups: [],
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      previousData: undefined,
      loading: false,
      error: undefined,
    });

    renderHook(() =>
      useGraphBarChartWidgetData({
        objectMetadataItemId: 'object-id',
        configuration: {} as never,
      }),
    );

    const queryArguments = (useQuery as jest.Mock).mock.calls[0]?.[1];

    expect(queryArguments).toEqual(
      expect.objectContaining({
        variables: {
          input: expect.objectContaining({
            configuration: expect.objectContaining({
              filter: expect.objectContaining({
                recordFilters: [
                  expect.objectContaining({
                    value: 'Closed Won',
                  }),
                ],
              }),
            }),
          }),
        },
      }),
    );
  });
});
