import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type DashboardFilters = {
  ownerId: string;
  startDate: string;
  endDate: string;
  stageId: string;
};

export type DashboardFilterState = {
  draftFilters: DashboardFilters;
  appliedFilters: DashboardFilters;
};

export const EMPTY_DASHBOARD_FILTERS: DashboardFilters = {
  ownerId: '',
  startDate: '',
  endDate: '',
  stageId: '',
};

export const dashboardFilterState = createAtomState<DashboardFilterState>({
  key: 'dashboardFilterState',
  defaultValue: {
    draftFilters: EMPTY_DASHBOARD_FILTERS,
    appliedFilters: EMPTY_DASHBOARD_FILTERS,
  },
});
