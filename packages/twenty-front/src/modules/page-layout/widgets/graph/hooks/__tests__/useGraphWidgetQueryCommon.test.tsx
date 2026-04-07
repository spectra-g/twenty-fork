import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { AggregateOperations, WidgetConfigurationType } from '~/generated-metadata/graphql';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: jest.fn(),
}));

jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: jest.fn(),
}));

const { useObjectMetadataItemById } = jest.requireMock(
  '@/object-metadata/hooks/useObjectMetadataItemById',
);
const { useUserTimezone } = jest.requireMock(
  '@/ui/input/components/internal/date/hooks/useUserTimezone',
);

const mockObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const idField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: mockObjectMetadataItem,
  fieldName: 'id',
});

describe('useGraphWidgetQueryCommon', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useObjectMetadataItemById.mockReturnValue({
      objectMetadataItem: mockObjectMetadataItem,
    });

    useUserTimezone.mockReturnValue({
      userTimezone: 'UTC',
    });
  });

  it('should merge widget-local and dashboard filters for aggregate queries', () => {
    const store = createStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PageLayoutTestWrapper store={store}>{children}</PageLayoutTestWrapper>
    );

    act(() => {
      store.set(
        dashboardFiltersComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        {
          recordFilters: [
            {
              id: 'dashboard-filter',
              fieldMetadataId: idField.id,
              operand: ViewFilterOperand.IS,
              type: FieldMetadataType.UUID,
              value: '4f83d5c0-7c7a-4f67-9f29-0a6aad1f4eb1',
            },
          ],
          recordFilterGroups: [],
        },
      );
    });

    const { result } = renderHook(
      () =>
        useGraphWidgetQueryCommon({
          objectMetadataItemId: mockObjectMetadataItem.id,
          configuration: {
            __typename: 'AggregateChartConfiguration',
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: idField.id,
            aggregateOperation: AggregateOperations.COUNT,
            filter: {
              recordFilters: [
                {
                  id: 'local-filter',
                  fieldMetadataId: idField.id,
                  operand: ViewFilterOperand.IS,
                  type: FieldMetadataType.UUID,
                  value: '4f83d5c0-7c7a-4f67-9f29-0a6aad1f4eb1',
                },
              ],
              recordFilterGroups: [],
            },
          },
        }),
      { wrapper },
    );

    expect(result.current.gqlOperationFilter).toEqual({
      and: [
        {
          id: {
            in: ['4f83d5c0-7c7a-4f67-9f29-0a6aad1f4eb1'],
          },
        },
        {
          id: {
            in: ['4f83d5c0-7c7a-4f67-9f29-0a6aad1f4eb1'],
          },
        },
      ],
    });
  });

  it('should keep widget-local filters when dashboard filters are cleared', () => {
    const store = createStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PageLayoutTestWrapper store={store}>{children}</PageLayoutTestWrapper>
    );

    const localFilterValue = '4f83d5c0-7c7a-4f67-9f29-0a6aad1f4eb1';
    const localFilter = {
      id: 'local-filter',
      fieldMetadataId: idField.id,
      operand: ViewFilterOperand.IS,
      type: FieldMetadataType.UUID,
      value: localFilterValue,
    };

    const { result } = renderHook(
      () =>
        useGraphWidgetQueryCommon({
          objectMetadataItemId: mockObjectMetadataItem.id,
          configuration: {
            __typename: 'AggregateChartConfiguration',
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: idField.id,
            aggregateOperation: AggregateOperations.COUNT,
            filter: {
              recordFilters: [localFilter],
              recordFilterGroups: [],
            },
          },
        }),
      { wrapper },
    );

    expect(result.current.gqlOperationFilter).toEqual({
      id: {
        in: [localFilterValue],
      },
    });
  });

  it('should use dashboard filters when the widget has no local filters', () => {
    const store = createStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PageLayoutTestWrapper store={store}>{children}</PageLayoutTestWrapper>
    );

    const dashboardFilterValue = '4f83d5c0-7c7a-4f67-9f29-0a6aad1f4eb2';

    act(() => {
      store.set(
        dashboardFiltersComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        {
          recordFilters: [
            {
              id: 'dashboard-filter',
              fieldMetadataId: idField.id,
              operand: ViewFilterOperand.IS,
              type: FieldMetadataType.UUID,
              value: dashboardFilterValue,
            },
          ],
          recordFilterGroups: [],
        },
      );
    });

    const { result } = renderHook(
      () =>
        useGraphWidgetQueryCommon({
          objectMetadataItemId: mockObjectMetadataItem.id,
          configuration: {
            __typename: 'AggregateChartConfiguration',
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: idField.id,
            aggregateOperation: AggregateOperations.COUNT,
            filter: null,
          },
        }),
      { wrapper },
    );

    expect(result.current.gqlOperationFilter).toEqual({
      id: {
        in: [dashboardFilterValue],
      },
    });
  });
});
