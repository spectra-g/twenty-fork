import { mergeFilters } from '@/page-layout/utils/mergeFilters';
import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

const createFilter = (
  id: string,
  fieldMetadataId: string,
  value: string,
): RecordFilter =>
  ({
    id,
    fieldMetadataId,
    value,
    displayValue: value,
    type: 'TEXT',
    operand: 'IS',
    label: fieldMetadataId,
  }) as RecordFilter;

describe('mergeFilters', () => {
  it('gives dashboard filter precedence on the same field', () => {
    const localFilters: ChartFilters = {
      recordFilters: [
        createFilter('local-1', 'field-stage', 'Prospecting'),
        createFilter('local-2', 'field-owner', 'Alice'),
      ],
      recordFilterGroups: [],
    };

    const dashboardFilters: ChartFilters = {
      recordFilters: [createFilter('global-1', 'field-stage', 'Closed Won')],
      recordFilterGroups: [],
    };

    const result = mergeFilters({ localFilters, dashboardFilters });

    expect(result.recordFilters).toHaveLength(2);
    expect(
      result.recordFilters?.find((filter) => filter.fieldMetadataId === 'field-stage')
        ?.value,
    ).toBe('Closed Won');
    expect(
      result.recordFilters?.find((filter) => filter.fieldMetadataId === 'field-owner')
        ?.value,
    ).toBe('Alice');
  });

  it('returns local filters unchanged when dashboard filters are empty', () => {
    const localFilters: ChartFilters = {
      recordFilters: [createFilter('local-1', 'field-stage', 'Prospecting')],
      recordFilterGroups: [],
    };

    const result = mergeFilters({
      localFilters,
      dashboardFilters: { recordFilters: [], recordFilterGroups: [] },
    });

    expect(result).toEqual(localFilters);
  });
});
