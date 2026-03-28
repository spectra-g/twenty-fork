// eslint-disable-next-line @nx/enforce-module-boundaries
import { type ChartFilter } from 'twenty-shared/types';

export const composeChartFilters = ({
  dashboardGlobalFilters,
  localFilters,
}: {
  dashboardGlobalFilters?: ChartFilter;
  localFilters?: ChartFilter;
}): ChartFilter | undefined => {
  if (dashboardGlobalFilters === undefined && localFilters === undefined) {
    return undefined;
  }

  return {
    ...dashboardGlobalFilters,
    ...localFilters,
  };
};
