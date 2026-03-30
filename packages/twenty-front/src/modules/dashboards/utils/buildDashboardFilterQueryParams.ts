import { type DashboardFilters } from '@/dashboards/states/dashboardFiltersState';
import { ViewFilterOperand } from 'twenty-shared/types';

export const buildDashboardFilterQueryParams = (
  dashboardFilters: DashboardFilters,
) => {
  const searchParams = new URLSearchParams();

  for (const [fieldName, value] of Object.entries(dashboardFilters)) {
    if (value === null) {
      continue;
    }

    searchParams.set(`filter[${fieldName}][${ViewFilterOperand.IS}]`, value);
  }

  return searchParams;
};
