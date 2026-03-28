import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { isDefined } from 'twenty-shared/utils';

type DashboardChartFilter = {
  fieldMetadataId: string;
  operand: string;
  value: string;
  subFieldName?: string | null;
};

type DashboardChartFilters = {
  recordFilters?: DashboardChartFilter[];
  recordFilterGroups?: ChartFilters['recordFilterGroups'];
};

export const mergeChartFilters = (
  localChartFilters?: ChartFilters,
  dashboardChartFilters?: DashboardChartFilters,
): ChartFilters | undefined => {
  if (!isDefined(localChartFilters) && !isDefined(dashboardChartFilters)) {
    return undefined;
  }

  if (!isDefined(dashboardChartFilters)) {
    return localChartFilters;
  }

  if (!isDefined(localChartFilters)) {
    return {
      recordFilters: dashboardChartFilters.recordFilters ?? [],
      recordFilterGroups: dashboardChartFilters.recordFilterGroups ?? [],
    };
  }

  const dashboardFieldIds = new Set(
    (dashboardChartFilters.recordFilters ?? []).map(
      ({ fieldMetadataId }) => fieldMetadataId,
    ),
  );

  const localRecordFilters = (localChartFilters.recordFilters ?? []).filter(
    ({ fieldMetadataId }) => !dashboardFieldIds.has(fieldMetadataId),
  );

  return {
    recordFilters: [
      ...localRecordFilters,
      ...(dashboardChartFilters.recordFilters ?? []),
    ],
    recordFilterGroups: localChartFilters.recordFilterGroups ?? [],
  };
};
