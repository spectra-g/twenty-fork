import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ViewFilterOperand } from 'twenty-shared/types';
import { mergeDashboardAndWidgetChartFilters } from '@/dashboards/utils/mergeDashboardAndWidgetChartFilters';

const createFilter = (
  id: string,
  fieldMetadataId: string,
  value: string,
): RecordFilter => ({
  id,
  fieldMetadataId,
  value,
  displayValue: value,
  type: 'TEXT',
  operand: ViewFilterOperand.IS,
  label: fieldMetadataId,
});

describe('mergeDashboardAndWidgetChartFilters', () => {
  it('AND-combines filters across distinct fields', () => {
    const merged = mergeDashboardAndWidgetChartFilters({
      dashboardRecordFilters: [createFilter('d1', 'status', 'won')],
      dashboardRecordFilterGroups: [],
      widgetRecordFilters: [createFilter('w1', 'owner', 'me')],
      widgetRecordFilterGroups: [],
    });

    expect(merged.recordFilters).toEqual([
      createFilter('d1', 'status', 'won'),
      createFilter('w1', 'owner', 'me'),
    ]);
    expect(merged.recordFilterGroups).toEqual([]);
  });

  it('dashboard filter overrides widget filter on same field', () => {
    const merged = mergeDashboardAndWidgetChartFilters({
      dashboardRecordFilters: [createFilter('d1', 'status', 'won')],
      dashboardRecordFilterGroups: [],
      widgetRecordFilters: [createFilter('w1', 'status', 'open')],
      widgetRecordFilterGroups: [],
    });

    expect(merged.recordFilters).toEqual([createFilter('d1', 'status', 'won')]);
  });

  it('falls back to widget filter when dashboard filter is cleared', () => {
    const merged = mergeDashboardAndWidgetChartFilters({
      dashboardRecordFilters: [],
      dashboardRecordFilterGroups: [],
      widgetRecordFilters: [createFilter('w1', 'status', 'open')],
      widgetRecordFilterGroups: [],
    });

    expect(merged.recordFilters).toEqual([createFilter('w1', 'status', 'open')]);
  });
});
