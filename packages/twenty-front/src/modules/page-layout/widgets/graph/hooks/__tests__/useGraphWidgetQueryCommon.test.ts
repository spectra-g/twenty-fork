import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { renderHook } from '@testing-library/react';
import { computeRecordGqlOperationFilter } from 'twenty-shared/utils';

const mockUseObjectMetadataItemById = jest.fn();
const mockUseUserTimezone = jest.fn();
const mockUseDashboardFilterState = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: (...args: unknown[]) =>
    mockUseObjectMetadataItemById(...args),
}));

jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => mockUseUserTimezone(),
}));

jest.mock('@/dashboard/hooks/useDashboardFilterState', () => {
  const actual = jest.requireActual('@/dashboard/hooks/useDashboardFilterState');

  return {
    ...actual,
    useDashboardFilterState: () => mockUseDashboardFilterState(),
  };
});

jest.mock('twenty-shared/utils', () => {
  const actual = jest.requireActual('twenty-shared/utils');

  return {
    ...actual,
    computeRecordGqlOperationFilter: jest.fn(),
  };
});

describe('useGraphWidgetQueryCommon', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseObjectMetadataItemById.mockReturnValue({
      objectMetadataItem: {
        fields: [],
        readableFields: [
          {
            id: 'aggregate-field-id',
            type: 'NUMBER',
          },
        ],
      },
    });

    mockUseUserTimezone.mockReturnValue({ userTimezone: 'UTC' });

    mockUseDashboardFilterState.mockReturnValue({
      filters: {
        owner: 'John',
        dateRange: 'LAST_30_DAYS',
        stage: 'Won',
      },
    });

    (computeRecordGqlOperationFilter as jest.Mock).mockReturnValue({
      and: [{ id: { eq: 'test' } }],
    });
  });

  it('merges dashboard filters with widget filters when computing gql operation filter', () => {
    const configuration = {
      aggregateFieldMetadataId: 'aggregate-field-id',
      filter: {
        recordFilters: [
          {
            id: 'widget-filter',
            fieldMetadataId: 'widget-filter',
            value: 'Open',
            displayValue: 'Open',
            type: 'TEXT',
            operand: 'IS',
            label: 'Status',
          },
        ],
        recordFilterGroups: [],
      },
    };

    renderHook(() =>
      useGraphWidgetQueryCommon({
        objectMetadataItemId: 'object-metadata-id',
        configuration: configuration as any,
      }),
    );

    expect(computeRecordGqlOperationFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        recordFilters: expect.arrayContaining([
          expect.objectContaining({ value: 'Open' }),
          expect.objectContaining({ value: 'John', label: 'Owner' }),
          expect.objectContaining({ value: 'LAST_30_DAYS', label: 'Date Range' }),
          expect.objectContaining({ value: 'Won', label: 'Stage' }),
        ]),
      }),
    );
  });
});
