import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { parseDashboardFilterQueryParams } from '@/dashboard-filters/utils/parseDashboardFilterQueryParams';
import { dashboardFilterState } from '@/dashboard-filters/states/dashboardFilterState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useHydrateDashboardFiltersFromUrl = () => {
  const [searchParams] = useSearchParams();
  const [, setDashboardFilterState] = useAtomState(dashboardFilterState);
  const [hasHydratedFromUrl, setHasHydratedFromUrl] = useState(false);

  useEffect(() => {
    if (hasHydratedFromUrl) {
      return;
    }

    const hydratedFilters = parseDashboardFilterQueryParams({
      searchParams,
    });

    setDashboardFilterState({
      draftFilters: hydratedFilters,
      appliedFilters: hydratedFilters,
    });
    setHasHydratedFromUrl(true);
  }, [hasHydratedFromUrl, searchParams, setDashboardFilterState]);

  return {
    hasHydratedFromUrl,
  };
};
