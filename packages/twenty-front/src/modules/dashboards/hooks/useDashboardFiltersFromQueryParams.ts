import qs from 'qs';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { dashboardFilterUrlQueryParamsSchema } from '@/dashboards/schemas/dashboardFilterUrlQueryParamsSchema';

export const useDashboardFiltersFromQueryParams = () => {
  const [searchParams] = useSearchParams();

  const dashboardFiltersFromQueryParams = useMemo(() => {
    const parsedQueryParams = dashboardFilterUrlQueryParamsSchema.safeParse(
      qs.parse(searchParams.toString()),
    );

    if (!parsedQueryParams.success) {
      return null;
    }

    const dashboardFilter = parsedQueryParams.data.dashboardFilter;

    if (dashboardFilter === undefined) {
      return null;
    }

    return {
      ownerId: dashboardFilter.ownerId ?? null,
      startDate: dashboardFilter.startDate ?? null,
      endDate: dashboardFilter.endDate ?? null,
      stage: dashboardFilter.stage ?? null,
    };
  }, [searchParams]);

  return {
    dashboardFiltersFromQueryParams,
  };
};
