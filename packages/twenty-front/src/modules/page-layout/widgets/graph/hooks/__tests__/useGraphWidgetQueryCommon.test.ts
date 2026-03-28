import { renderHook } from '@testing-library/react';

import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';

const mockUseDashboardFilters = jest.fn();
const mockComputeRecordGqlOperationFilter = jest.fn();

jest.mock('@/dashboard-filters/hooks/useDashboardFilters', () => ({
  useDashboardFilters: () => mockUseDashboardFilters(),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({
    objectMetadataItem: {
      fields: [
        { id: 'owner-field-id', name: 'owner' },
        { id: 'close-date-field-id', name: 'closeDate' },
        { id: 'stage-field-id', name: 'stage' },
      ],
      readableFields: [{ id: 'aggregate-field-id', name: 'amount' }],
    },
  }),
}));

jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => ({
    userTimezone: 'Europe/London',
  }),
}));

jest.mock('twenty-shared/utils', () => ({
  computeRecordGqlOperationFilter: (args: unknown) =>
    mockComputeRecordGqlOperationFilter(args),
  isDefined: (value: unknown) => value !== undefined && value !== null,
}));

describe('useGraphWidgetQueryCommon', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockComputeRecordGqlOperationFilter.mockImplementation(
      ({ recordFilters, recordFilterGroups }) => ({
        recordFilters,
        recordFilterGroups,
      }),
    );
  });

  it('merges widget-local filters with applied dashboard filters', () => {
    mockUseDashboardFilters.mockReturnValue({
      appliedFilters: {
        ownerId: 'owner-1',
        startDate: '',
        endDate: '',
        stageId: '',
      },
    });

    const { result } = renderHook(() =>
      useGraphWidgetQueryCommon({
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
            recordFilterGroups: [],
          },
        } as never,
      }),
    );

    expect(result.current.gqlOperationFilter).toEqual({
      recordFilters: expect.arrayContaining([
        expect.objectContaining({
          fieldMetadataId: 'widget-field-id',
          operand: 'IS',
          value: 'widget',
        }),
        expect.objectContaining({
          fieldMetadataId: 'owner-field-id',
          operand: 'IS',
        }),
      ]),
      recordFilterGroups: [],
    });
  });

  it('keeps widget-local filters when no dashboard filters are applied', () => {
    mockUseDashboardFilters.mockReturnValue({
      appliedFilters: {
        ownerId: '',
        startDate: '',
        endDate: '',
        stageId: '',
      },
    });

    const { result } = renderHook(() =>
      useGraphWidgetQueryCommon({
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
            recordFilterGroups: [],
          },
        } as never,
      }),
    );

    expect(result.current.gqlOperationFilter).toEqual({
      recordFilters: [
        expect.objectContaining({
          fieldMetadataId: 'widget-field-id',
          operand: 'IS',
          value: 'widget',
        }),
      ],
      recordFilterGroups: [],
    });
  });

  it('keeps the dashboard filter when widget and dashboard filters target the same field', () => {
    mockUseDashboardFilters.mockReturnValue({
      appliedFilters: {
        ownerId: 'owner-1',
        startDate: '',
        endDate: '',
        stageId: '',
      },
    });

    const { result } = renderHook(() =>
      useGraphWidgetQueryCommon({
        objectMetadataItemId: 'object-id',
        configuration: {
          aggregateFieldMetadataId: 'aggregate-field-id',
          filter: {
            recordFilters: [
              {
                fieldMetadataId: 'owner-field-id',
                operand: 'IS',
                value: 'owner-2',
              },
            ],
            recordFilterGroups: [],
          },
        } as never,
      }),
    );

    expect(result.current.gqlOperationFilter).toEqual({
      recordFilters: [
        expect.objectContaining({
          fieldMetadataId: 'owner-field-id',
          operand: 'IS',
          value: expect.stringContaining('owner-1'),
        }),
      ],
      recordFilterGroups: [],
    });
  });
});
