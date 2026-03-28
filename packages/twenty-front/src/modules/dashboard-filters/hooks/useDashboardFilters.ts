import {
  EMPTY_DASHBOARD_FILTERS,
  dashboardFilterState,
} from '@/dashboard-filters/states/dashboardFilterState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useDashboardFilters = () => {
  const [dashboardFilter, setDashboardFilter] =
    useAtomState(dashboardFilterState);

  const setDraftFilter = (
    key: keyof typeof EMPTY_DASHBOARD_FILTERS,
    value: string,
  ) => {
    setDashboardFilter((currentDashboardFilter) => ({
      ...currentDashboardFilter,
      draftFilters: {
        ...currentDashboardFilter.draftFilters,
        [key]: value,
      },
    }));
  };

  return {
    draftFilters: dashboardFilter.draftFilters,
    appliedFilters: dashboardFilter.appliedFilters,
    setOwnerId: (ownerId: string) => setDraftFilter('ownerId', ownerId),
    setStartDate: (startDate: string) => setDraftFilter('startDate', startDate),
    setEndDate: (endDate: string) => setDraftFilter('endDate', endDate),
    setStageId: (stageId: string) => setDraftFilter('stageId', stageId),
    applyFilters: () =>
      setDashboardFilter((currentDashboardFilter) => ({
        ...currentDashboardFilter,
        appliedFilters: currentDashboardFilter.draftFilters,
      })),
    applyPresetFilters: (filters: typeof EMPTY_DASHBOARD_FILTERS) =>
      setDashboardFilter({
        draftFilters: filters,
        appliedFilters: filters,
      }),
    clearFilters: () =>
      setDashboardFilter({
        draftFilters: EMPTY_DASHBOARD_FILTERS,
        appliedFilters: EMPTY_DASHBOARD_FILTERS,
      }),
  };
};
