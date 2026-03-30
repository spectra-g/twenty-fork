import {
  type DashboardFilterField,
  dashboardFiltersState,
  EMPTY_DASHBOARD_FILTERS,
} from '@/dashboards/states/dashboardFiltersState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useDashboardFilters = (dashboardId: string | undefined) => {
  const [dashboardFiltersById, setDashboardFiltersById] =
    useAtomState(dashboardFiltersState);

  const dashboardFilters = dashboardId
    ? (dashboardFiltersById[dashboardId] ?? EMPTY_DASHBOARD_FILTERS)
    : EMPTY_DASHBOARD_FILTERS;

  const setDashboardFilter = (
    field: DashboardFilterField,
    value: string | null,
  ) => {
    if (!dashboardId) {
      return;
    }

    setDashboardFiltersById((currentDashboardFiltersById) => ({
      ...currentDashboardFiltersById,
      [dashboardId]: {
        ...(currentDashboardFiltersById[dashboardId] ??
          EMPTY_DASHBOARD_FILTERS),
        [field]: value,
      },
    }));
  };

  return {
    dashboardFilters,
    setDashboardFilter,
  };
};
