import { renderHook } from '@testing-library/react';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { FieldMetadataType } from 'twenty-shared/types';
import { AggregateOperations } from '~/generated-metadata/graphql';

const computeRecordGqlOperationFilter = jest.fn().mockReturnValue({
  and: [],
});

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({
    objectMetadataItem: {
      nameSingular: 'person',
      readableFields: [
        {
          id: 'aggregate-field-id',
          type: FieldMetadataType.TEXT,
          name: 'city',
        },
      ],
      fields: [
        {
          id: 'aggregate-field-id',
          type: FieldMetadataType.TEXT,
          name: 'city',
        },
        {
          id: 'local-field-id',
          type: FieldMetadataType.TEXT,
          name: 'city',
        },
        {
          id: 'dashboard-field-id',
          type: FieldMetadataType.TEXT,
          name: 'name',
        },
      ],
    },
  }),
}));

jest.mock('@/page-layout/hooks/useDashboardFilters', () => ({
  useDashboardFilters: () => ({
    dashboardFilters: [
      {
        id: 'dashboard-filter',
        fieldMetadataId: 'dashboard-field-id',
        value: 'Apple',
        displayValue: 'Apple',
        operand: 'CONTAINS',
        type: FieldMetadataType.TEXT,
        label: 'Name',
      },
    ],
  }),
}));

jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => ({
    userTimezone: 'UTC',
  }),
}));

jest.mock('twenty-shared/utils', () => ({
  computeRecordGqlOperationFilter: (...args: unknown[]) =>
    computeRecordGqlOperationFilter(...args),
  isDefined: (value: unknown) => value !== undefined && value !== null,
}));

describe('useGraphWidgetQueryCommon', () => {
  beforeEach(() => {
    computeRecordGqlOperationFilter.mockClear();
  });

  it('composes local widget filters with dashboard-global filters for aggregate queries', () => {
    renderHook(() =>
      useGraphWidgetQueryCommon({
        objectMetadataItemId: 'person-object-id',
        configuration: {
          aggregateFieldMetadataId: 'aggregate-field-id',
          aggregateOperation: AggregateOperations.COUNT,
          filter: {
            recordFilters: [
              {
                id: 'local-filter',
                fieldMetadataId: 'local-field-id',
                value: 'Local',
                displayValue: 'Local',
                operand: 'CONTAINS',
                type: FieldMetadataType.TEXT,
                label: 'City',
              },
            ],
            recordFilterGroups: [],
          },
        } as never,
      }),
    );

    expect(computeRecordGqlOperationFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        filterValueDependencies: {
          timeZone: 'UTC',
        },
        recordFilters: [
          expect.objectContaining({
            id: 'dashboard-filter',
            fieldMetadataId: 'dashboard-field-id',
            recordFilterGroupId: 'dashboard-global-and-local-root-group',
          }),
          expect.objectContaining({
            id: 'local-filter',
            fieldMetadataId: 'local-field-id',
            recordFilterGroupId: 'dashboard-global-and-local-root-group',
          }),
        ],
        recordFilterGroups: [
          expect.objectContaining({
            id: 'dashboard-global-and-local-root-group',
            logicalOperator: 'AND',
          }),
        ],
      }),
    );
  });
});
