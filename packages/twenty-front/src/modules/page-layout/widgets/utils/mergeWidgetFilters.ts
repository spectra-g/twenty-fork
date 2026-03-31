import { type ChartFilter } from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

import {
  getWidgetFilterApplicability,
  type DashboardWidgetFilterDimension,
} from '@/page-layout/widgets/utils/widgetFilterApplicability';

export type DashboardWidgetFilter = {
  dimension: DashboardWidgetFilterDimension;
  filter: ChartFilter;
};

type MergeWidgetFiltersParams = {
  widgetType: WidgetType | string;
  widgetFilter?: ChartFilter;
  dashboardFilters?: DashboardWidgetFilter[];
};

const mergeChartFilters = (filters: (ChartFilter | undefined)[]) => {
  const recordFilters = filters.flatMap((filter) => filter?.recordFilters ?? []);
  const recordFilterGroups = filters.flatMap(
    (filter) => filter?.recordFilterGroups ?? [],
  );

  if (recordFilters.length === 0 && recordFilterGroups.length === 0) {
    return undefined;
  }

  return {
    recordFilters,
    recordFilterGroups,
  };
};

export const mergeWidgetFilters = ({
  widgetType,
  widgetFilter,
  dashboardFilters = [],
}: MergeWidgetFiltersParams): ChartFilter | undefined => {
  const { supportedDimensions } = getWidgetFilterApplicability(widgetType);

  const applicableDashboardFilters = dashboardFilters
    .filter((dashboardFilter) =>
      supportedDimensions.includes(dashboardFilter.dimension),
    )
    .map((dashboardFilter) => dashboardFilter.filter);

  return mergeChartFilters([widgetFilter, ...applicableDashboardFilters]);
};
