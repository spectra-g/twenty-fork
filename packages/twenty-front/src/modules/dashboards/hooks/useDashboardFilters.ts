import {
  type DashboardFilterField,
  type DashboardFilters,
  dashboardFiltersState,
  EMPTY_DASHBOARD_FILTERS,
} from '@/dashboards/states/dashboardFiltersState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useDashboardFilters = (dashboardId: string | undefined) => {
  const [dashboardFilters, setDashboardFilters] = useAtomState(
    dashboardFiltersState,
  );

  const currentDashboardFilters = dashboardId
    ? (dashboardFilters[dashboardId] ?? EMPTY_DASHBOARD_FILTERS)
    : EMPTY_DASHBOARD_FILTERS;

  const setDashboardFilter = (
    field: DashboardFilterField,
    value: string | null,
  ) => {
    if (!dashboardId) {
      return;
    }

    setDashboardFilters((currentDashboardFiltersById) => ({
      ...currentDashboardFiltersById,
      [dashboardId]: {
        ...(currentDashboardFiltersById[dashboardId] ??
          EMPTY_DASHBOARD_FILTERS),
        [field]: value,
      },
    }));
  };

  const replaceDashboardFilters = (nextDashboardFilters: DashboardFilters) => {
    if (!dashboardId) {
      return;
    }

    setDashboardFilters((currentDashboardFiltersById) => ({
      ...currentDashboardFiltersById,
      [dashboardId]: nextDashboardFilters,
    }));
  };

  return {
    dashboardFilters: currentDashboardFilters,
    replaceDashboardFilters,
    setDashboardFilter,
  };
};
