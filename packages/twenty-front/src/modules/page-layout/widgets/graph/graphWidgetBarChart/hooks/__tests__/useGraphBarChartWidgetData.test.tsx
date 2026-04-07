import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { useQuery } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import {
  AggregateOperations,
  BarChartLayout,
  GraphOrderBy,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';

jest.mock('@apollo/client', () => ({
  gql: jest.fn(),
  useQuery: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: jest.fn(),
}));

describe('useGraphBarChartWidgetData', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useObjectMetadataItemById as jest.Mock).mockReturnValue({
      objectMetadataItem: {
        id: 'person-id',
        fields: [],
      },
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      previousData: undefined,
      loading: false,
      error: undefined,
    });
  });

  it('should refresh two widgets with the dashboard filter when it changes', () => {
    const store = createStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PageLayoutTestWrapper store={store}>{children}</PageLayoutTestWrapper>
    );

    const baseConfiguration = {
      __typename: 'BarChartConfiguration',
      configurationType: WidgetConfigurationType.BAR_CHART,
      layout: BarChartLayout.VERTICAL,
      aggregateOperation: AggregateOperations.COUNT,
      aggregateFieldMetadataId: 'aggregate-field-id',
      primaryAxisGroupByFieldMetadataId: 'group-by-field-id',
      primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
      filter: {
        recordFilters: [
          {
            id: 'widget-local-filter',
            fieldMetadataId: 'ignored-field-id',
            operand: ViewFilterOperand.IS,
            type: FieldMetadataType.TEXT,
            value: 'Ignored',
          },
        ],
        recordFilterGroups: [],
      },
    } as const;

    const firstWidget = renderHook(
      () =>
        useGraphBarChartWidgetData({
          objectMetadataItemId: 'person-id',
          configuration: baseConfiguration,
        }),
      { wrapper },
    );

    const secondWidget = renderHook(
      () =>
        useGraphBarChartWidgetData({
          objectMetadataItemId: 'person-id',
          configuration: {
            ...baseConfiguration,
            aggregateFieldMetadataId: 'second-aggregate-field-id',
          },
        }),
      { wrapper },
    );

    act(() => {
      store.set(
        dashboardFiltersComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        {
          recordFilters: [
            {
              id: 'dashboard-status-filter',
              fieldMetadataId: 'status-field-id',
              operand: ViewFilterOperand.IS,
              type: FieldMetadataType.SELECT,
              value: 'OPEN',
            },
          ],
          recordFilterGroups: [],
        },
      );
    });

    firstWidget.rerender();
    secondWidget.rerender();

    expect((useQuery as jest.Mock).mock.calls[6]?.[1]).toEqual(
      expect.objectContaining({
        variables: {
          input: {
            objectMetadataId: 'person-id',
            configuration: expect.objectContaining({
              filter: {
                recordFilters: [
                  expect.objectContaining({
                    id: 'dashboard-status-filter',
                    value: 'OPEN',
                  }),
                ],
                recordFilterGroups: [],
              },
            }),
          },
        },
      }),
    );

    expect((useQuery as jest.Mock).mock.calls[7]?.[1]).toEqual(
      expect.objectContaining({
        variables: {
          input: {
            objectMetadataId: 'person-id',
            configuration: expect.objectContaining({
              filter: {
                recordFilters: [
                  expect.objectContaining({
                    id: 'dashboard-status-filter',
                    value: 'OPEN',
                  }),
                ],
                recordFilterGroups: [],
              },
            }),
          },
        },
      }),
    );
  });
});
