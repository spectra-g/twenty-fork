import {
  EMPTY_DASHBOARD_FILTERS,
  dashboardFilterState,
} from '@/dashboard-filters/states/dashboardFilterState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useDashboardFilters = () => {
  const [dashboardFilters, setDashboardFilters] = useAtomState(
    dashboardFilterState,
  );

  const setDraftFilter = (
    key: keyof typeof EMPTY_DASHBOARD_FILTERS,
    value: string,
  ) => {
    setDashboardFilters((currentDashboardFilters) => ({
      ...currentDashboardFilters,
      draftFilters: {
        ...currentDashboardFilters.draftFilters,
        [key]: value,
      },
    }));
  };

  return {
    draftFilters: dashboardFilters.draftFilters,
    appliedFilters: dashboardFilters.appliedFilters,
    setOwnerId: (ownerId: string) => setDraftFilter('ownerId', ownerId),
    setStartDate: (startDate: string) => setDraftFilter('startDate', startDate),
    setEndDate: (endDate: string) => setDraftFilter('endDate', endDate),
    setStageId: (stageId: string) => setDraftFilter('stageId', stageId),
    applyFilters: () =>
      setDashboardFilters((currentDashboardFilters) => ({
        ...currentDashboardFilters,
        appliedFilters: currentDashboardFilters.draftFilters,
      })),
    clearFilters: () =>
      setDashboardFilters({
        draftFilters: EMPTY_DASHBOARD_FILTERS,
        appliedFilters: EMPTY_DASHBOARD_FILTERS,
      }),
  };
};
