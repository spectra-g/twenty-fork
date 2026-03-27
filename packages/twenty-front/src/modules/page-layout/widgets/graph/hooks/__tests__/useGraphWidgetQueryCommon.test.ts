import { DashboardFiltersContext } from '@/dashboards/contexts/DashboardFiltersContext';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { renderHook } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';

const mockUseObjectMetadataItemById = jest.fn();
const mockUseUserTimezone = jest.fn();
const mockComputeRecordGqlOperationFilter = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: (...args: unknown[]) =>
    mockUseObjectMetadataItemById(...args),
}));

jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => mockUseUserTimezone(),
}));

jest.mock('twenty-shared/utils', () => ({
  computeRecordGqlOperationFilter: (...args: unknown[]) =>
    mockComputeRecordGqlOperationFilter(...args),
  isDefined: (value: unknown) => value !== undefined && value !== null,
}));

describe('useGraphWidgetQueryCommon', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseUserTimezone.mockReturnValue({
      userTimezone: 'UTC',
    });

    mockUseObjectMetadataItemById.mockReturnValue({
      objectMetadataItem: {
        fields: [
          {
            id: 'stage-field-metadata-id',
            name: 'stage',
            type: 'SELECT',
          },
          {
            id: 'created-at-field-metadata-id',
            name: 'createdAt',
            type: 'DATE',
          },
          {
            id: 'amount-field-metadata-id',
            name: 'amount',
            type: 'CURRENCY',
          },
        ],
        readableFields: [
          {
            id: 'amount-field-metadata-id',
            name: 'amount',
            type: 'CURRENCY',
          },
        ],
      },
    });

    mockComputeRecordGqlOperationFilter.mockReturnValue({
      and: ['merged'],
    });
  });

  it('should merge widget filters with applicable dashboard filters before computing the gql filter', () => {
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(
        DashboardFiltersContext.Provider,
        {
          value: [
            {
              fieldMetadataId: 'created-at-field-metadata-id',
              operand: ViewFilterOperand.IS_AFTER,
              value: '2025-01-01',
            },
            {
              fieldMetadataId: 'other-object-field-metadata-id',
              operand: ViewFilterOperand.IS,
              value: 'ignored',
            },
          ],
        },
        children,
      );

    renderHook(
      () =>
        useGraphWidgetQueryCommon({
          objectMetadataItemId: 'opportunity-object-id',
          configuration: {
            aggregateFieldMetadataId: 'amount-field-metadata-id',
            filter: {
              recordFilters: [
                {
                  fieldMetadataId: 'stage-field-metadata-id',
                  operand: ViewFilterOperand.IS,
                  value: '["SCREENING"]',
                },
              ],
              recordFilterGroups: [],
            },
          } as any,
        }),
      { wrapper },
    );

    expect(mockComputeRecordGqlOperationFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        recordFilters: [
          {
            fieldMetadataId: 'stage-field-metadata-id',
            operand: ViewFilterOperand.IS,
            value: '["SCREENING"]',
          },
          {
            fieldMetadataId: 'created-at-field-metadata-id',
            operand: ViewFilterOperand.IS_AFTER,
            value: '2025-01-01',
          },
        ],
      }),
    );
  });
});
