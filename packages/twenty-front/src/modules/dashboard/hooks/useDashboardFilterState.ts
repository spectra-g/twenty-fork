import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import {
  DEFAULT_DASHBOARD_FILTER_STATE,
  type DashboardDateRangeFilterValue,
  type DashboardFilterState,
} from '@/dashboard/types/DashboardFilter';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { atom, useAtomValue, useSetAtom } from 'jotai';

const dashboardFilterStateAtom = atom<DashboardFilterState>(
  DEFAULT_DASHBOARD_FILTER_STATE,
);

const buildRecordFiltersFromDashboardFilters = (
  filters: DashboardFilterState,
): NonNullable<ChartFilters['recordFilters']> => {
  const recordFilters: NonNullable<ChartFilters['recordFilters']> = [];

  if (filters.owner) {
    recordFilters.push({
      id: 'dashboard-filter-owner',
      fieldMetadataId: 'dashboard-filter-owner',
      value: filters.owner,
      displayValue: filters.owner,
      type: FieldMetadataType.TEXT,
      operand: ViewFilterOperand.IS,
      label: 'Owner',
    });
  }

  if (filters.dateRange) {
    recordFilters.push({
      id: 'dashboard-filter-date-range',
      fieldMetadataId: 'dashboard-filter-date-range',
      value: filters.dateRange,
      displayValue: filters.dateRange,
      type: FieldMetadataType.TEXT,
      operand: ViewFilterOperand.IS,
      label: 'Date Range',
    });
  }

  if (filters.stage) {
    recordFilters.push({
      id: 'dashboard-filter-stage',
      fieldMetadataId: 'dashboard-filter-stage',
      value: filters.stage,
      displayValue: filters.stage,
      type: FieldMetadataType.TEXT,
      operand: ViewFilterOperand.IS,
      label: 'Stage',
    });
  }

  return recordFilters;
};

export const mergeDashboardFiltersWithChartFilter = ({
  chartFilter,
  dashboardFilters,
}: {
  chartFilter?: ChartFilters | null;
  dashboardFilters: DashboardFilterState;
}): ChartFilters | undefined => {
  const dashboardRecordFilters =
    buildRecordFiltersFromDashboardFilters(dashboardFilters);

  const existingRecordFilters = chartFilter?.recordFilters ?? [];
  const existingRecordFilterGroups = chartFilter?.recordFilterGroups ?? [];

  if (
    existingRecordFilters.length === 0 &&
    existingRecordFilterGroups.length === 0 &&
    dashboardRecordFilters.length === 0
  ) {
    return undefined;
  }

  return {
    recordFilters: [...existingRecordFilters, ...dashboardRecordFilters],
    recordFilterGroups: existingRecordFilterGroups,
  };
};

export const useDashboardFilterState = () => {
  const filters = useAtomValue(dashboardFilterStateAtom);
  const setFilters = useSetAtom(dashboardFilterStateAtom);

  return {
    filters,
    setOwnerFilter: (owner: string | null) => {
      setFilters((current) => ({ ...current, owner }));
    },
    setDateRangeFilter: (dateRange: DashboardDateRangeFilterValue | null) => {
      setFilters((current) => ({ ...current, dateRange }));
    },
    setStageFilter: (stage: string | null) => {
      setFilters((current) => ({ ...current, stage }));
    },
    resetFilters: () => {
      setFilters(DEFAULT_DASHBOARD_FILTER_STATE);
    },
  };
};
