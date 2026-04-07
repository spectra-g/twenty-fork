/* eslint-disable @nx/enforce-module-boundaries */
import {
  getFiltersFromUrl,
  getSearchParamsFromFilters,
} from '@/page-layout/hooks/useDashboardUrlFilters';
import {
  FieldMetadataType,
  ViewFilterOperand,
  type ChartFilter,
} from 'twenty-shared/types';

const objectMetadataItem = {
  id: 'person-id',
  fields: [
    {
      id: 'status-field-id',
      name: 'status',
      label: 'Status',
      type: FieldMetadataType.SELECT,
    },
  ],
  readableFields: [],
} as never;

describe('useDashboardUrlFilters', () => {
  it('should encode dashboard filters into search params while preserving unrelated query params', () => {
    const searchParams = getSearchParamsFromFilters({
      searchParams: new URLSearchParams('view=board'),
      filterState: {
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
      } as ChartFilter,
      objectMetadataItem,
    });

    expect(searchParams.toString()).toBe(
      'view=board&filter%5Bstatus%5D%5BIS%5D=OPEN',
    );
  });

  it('should decode dashboard filters from search params', () => {
    const filters = getFiltersFromUrl({
      searchParams: new URLSearchParams('filter[status][IS]=OPEN'),
      objectMetadataItem,
    });

    expect(filters).toEqual({
      recordFilters: [
        expect.objectContaining({
          fieldMetadataId: 'status-field-id',
          operand: ViewFilterOperand.IS,
          type: FieldMetadataType.SELECT,
          value: 'OPEN',
        }),
      ],
      recordFilterGroups: [],
    });
  });

  it('should remove filter params when dashboard filters are cleared', () => {
    const searchParams = getSearchParamsFromFilters({
      searchParams: new URLSearchParams(
        'view=board&filter%5Bstatus%5D%5BIS%5D=OPEN',
      ),
      filterState: {
        recordFilters: [],
        recordFilterGroups: [],
      },
      objectMetadataItem,
    });

    expect(searchParams.toString()).toBe('view=board');
  });
});
