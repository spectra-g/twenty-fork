import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { type DashboardFilterState } from '@/page-layout/types/DashboardFilterState';
import { mergeFilters } from '@/page-layout/utils/mergeFilters';
import { useMemo } from 'react';

export const useEffectiveFilters = ({
  localFilters,
  dashboardFilterState,
}: {
  localFilters?: ChartFilters;
  dashboardFilterState?: DashboardFilterState;
}): ChartFilters => {
  return useMemo(
    () =>
      mergeFilters({
        localFilters,
        dashboardFilters: dashboardFilterState,
      }),
    [dashboardFilterState, localFilters],
  );
};
