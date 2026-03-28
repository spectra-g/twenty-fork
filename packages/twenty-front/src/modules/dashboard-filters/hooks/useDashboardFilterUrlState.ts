import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { dashboardFilterState } from '@/dashboard-filters/states/dashboardFilterState';
import { buildDashboardFilterUrlQueryParams } from '@/dashboard-filters/utils/buildDashboardFilterUrlQueryParams';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useDashboardFilterUrlState = ({
  isEnabled,
}: {
  isEnabled: boolean;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dashboardFilters] = useAtomState(dashboardFilterState);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const currentSearchParams = new URLSearchParams(searchParams.toString());

    Array.from(currentSearchParams.keys()).forEach((key) => {
      if (key.startsWith('filter[') || key.startsWith('filterGroup[')) {
        currentSearchParams.delete(key);
      }
    });

    const dashboardFilterParams = buildDashboardFilterUrlQueryParams(
      dashboardFilters.appliedFilters,
    );

    dashboardFilterParams.forEach((value, key) => {
      currentSearchParams.append(key, value);
    });

    if (currentSearchParams.toString() === searchParams.toString()) {
      return;
    }

    setSearchParams(currentSearchParams, { replace: true });
  }, [
    dashboardFilters.appliedFilters,
    isEnabled,
    searchParams,
    setSearchParams,
  ]);
};
