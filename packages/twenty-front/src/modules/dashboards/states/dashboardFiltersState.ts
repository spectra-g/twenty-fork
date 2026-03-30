import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type DashboardFilters = {
  ownerId: string | null;
  dateRange: string | null;
  stageId: string | null;
};

export type DashboardFilterField = keyof DashboardFilters;

export const EMPTY_DASHBOARD_FILTERS: DashboardFilters = {
  ownerId: null,
  dateRange: null,
  stageId: null,
};

export const dashboardFiltersState = createAtomState<
  Record<string, DashboardFilters>
>({
  key: 'dashboardFiltersState',
  defaultValue: {},
});
