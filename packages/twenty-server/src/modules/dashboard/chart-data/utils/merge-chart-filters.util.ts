/* eslint-disable @nx/enforce-module-boundaries */
import { type ChartFilter } from 'twenty-shared/types';

export const mergeChartFilters = ({
  globalFilters,
  localFilters,
}: {
  globalFilters?: ChartFilter;
  localFilters?: ChartFilter;
}): ChartFilter | undefined => {
  const recordFilters = [
    ...(globalFilters?.recordFilters ?? []),
    ...(localFilters?.recordFilters ?? []),
  ];
  const recordFilterGroups = [
    ...(globalFilters?.recordFilterGroups ?? []),
    ...(localFilters?.recordFilterGroups ?? []),
  ];

  if (recordFilters.length === 0 && recordFilterGroups.length === 0) {
    return undefined;
  }

  return {
    recordFilters,
    recordFilterGroups,
  };
};
