import { type DashboardFiltersState } from '@/dashboards/states/dashboardFiltersAtom';

export const buildDashboardFilterQueryParams = (
  dashboardFilters: DashboardFiltersState,
) => {
  const queryParams: Record<string, string> = {};

  if (dashboardFilters.ownerId !== null) {
    queryParams['dashboardFilter[ownerId]'] = dashboardFilters.ownerId;
  }

  if (dashboardFilters.startDate !== null) {
    queryParams['dashboardFilter[startDate]'] = dashboardFilters.startDate;
  }

  if (dashboardFilters.endDate !== null) {
    queryParams['dashboardFilter[endDate]'] = dashboardFilters.endDate;
  }

  if (dashboardFilters.stage !== null) {
    queryParams['dashboardFilter[stage]'] = dashboardFilters.stage;
  }

  return queryParams;
};
