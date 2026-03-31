import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { type DashboardFiltersState } from '@/dashboards/states/dashboardFiltersAtom';
import { buildDashboardFilterQueryParams } from '@/dashboards/utils/buildDashboardFilterQueryParams';

type UseSyncDashboardFiltersToUrlProps = {
  dashboardFilters: DashboardFiltersState;
  isEnabled: boolean;
};

export const useSyncDashboardFiltersToUrl = ({
  dashboardFilters,
  isEnabled,
}: UseSyncDashboardFiltersToUrlProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);

    Array.from(nextSearchParams.keys()).forEach((key) => {
      if (key.startsWith('dashboardFilter[')) {
        nextSearchParams.delete(key);
      }
    });

    const nextDashboardFilterQueryParams =
      buildDashboardFilterQueryParams(dashboardFilters);

    Object.entries(nextDashboardFilterQueryParams).forEach(([key, value]) => {
      nextSearchParams.set(key, value);
    });

    if (nextSearchParams.toString() === searchParams.toString()) {
      return;
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [dashboardFilters, isEnabled, searchParams, setSearchParams]);
};
