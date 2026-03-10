import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const mergeDashboardAndWidgetChartFilters = ({
  dashboardRecordFilters,
  dashboardRecordFilterGroups,
  widgetRecordFilters,
  widgetRecordFilterGroups,
}: {
  dashboardRecordFilters: RecordFilter[];
  dashboardRecordFilterGroups: RecordFilterGroup[];
  widgetRecordFilters: RecordFilter[];
  widgetRecordFilterGroups: RecordFilterGroup[];
}): {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
} => {
  const dashboardFieldIds = new Set(
    dashboardRecordFilters.map((filter) => filter.fieldMetadataId),
  );

  const widgetFiltersWithoutOverriddenFields = widgetRecordFilters.filter(
    (filter) => !dashboardFieldIds.has(filter.fieldMetadataId),
  );

  return {
    recordFilters: [
      ...dashboardRecordFilters,
      ...widgetFiltersWithoutOverriddenFields,
    ],
    recordFilterGroups: [
      ...dashboardRecordFilterGroups,
      ...widgetRecordFilterGroups,
    ],
  };
};
