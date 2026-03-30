import { type DashboardFilters } from '@/dashboards/states/dashboardFiltersState';
import { buildDashboardFilterQueryParams } from '@/dashboards/utils/buildDashboardFilterQueryParams';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const isDashboardFilterQueryParam = (key: string) => key.startsWith('filter[');

export const useSyncDashboardFiltersToUrl = (
  dashboardFilters: DashboardFilters,
  isEnabled = true,
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);

    Array.from(nextSearchParams.keys())
      .filter(isDashboardFilterQueryParam)
      .forEach((key) => {
        nextSearchParams.delete(key);
      });

    const dashboardFilterSearchParams =
      buildDashboardFilterQueryParams(dashboardFilters);

    dashboardFilterSearchParams.forEach((value, key) => {
      nextSearchParams.append(key, value);
    });

    if (nextSearchParams.toString() === searchParams.toString()) {
      return;
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [dashboardFilters, isEnabled, searchParams, setSearchParams]);
};
