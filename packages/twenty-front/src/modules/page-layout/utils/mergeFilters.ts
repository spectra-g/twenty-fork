import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

const getFilterConflictKey = (filter: RecordFilter): string => {
  const subFieldName = filter.subFieldName ?? '';

  return `${filter.fieldMetadataId}:${subFieldName}`;
};

export const mergeFilters = ({
  localFilters,
  dashboardFilters,
}: {
  localFilters?: ChartFilters;
  dashboardFilters?: ChartFilters;
}): ChartFilters => {
  const localRecordFilters = localFilters?.recordFilters ?? [];
  const localRecordFilterGroups = localFilters?.recordFilterGroups ?? [];

  const dashboardRecordFilters = dashboardFilters?.recordFilters ?? [];
  const dashboardRecordFilterGroups = dashboardFilters?.recordFilterGroups ?? [];

  const hasDashboardFilters =
    dashboardRecordFilters.length > 0 || dashboardRecordFilterGroups.length > 0;

  if (!hasDashboardFilters) {
    return {
      recordFilters: localRecordFilters,
      recordFilterGroups: localRecordFilterGroups,
    };
  }

  const dashboardConflictKeys = new Set(
    dashboardRecordFilters.map((filter) => getFilterConflictKey(filter)),
  );

  const localRecordFiltersWithoutConflicts = localRecordFilters.filter(
    (filter) => !dashboardConflictKeys.has(getFilterConflictKey(filter)),
  );

  return {
    recordFilters: [
      ...localRecordFiltersWithoutConflicts,
      ...dashboardRecordFilters,
    ],
    recordFilterGroups: [
      ...localRecordFilterGroups,
      ...dashboardRecordFilterGroups,
    ],
  };
};
