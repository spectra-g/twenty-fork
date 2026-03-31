import {
  WidgetType,
  type PieChartConfiguration,
} from '~/generated-metadata/graphql';

import {
  type DashboardWidgetFilter,
  mergeWidgetFilters,
} from '@/page-layout/widgets/utils/mergeWidgetFilters';

type PieChartStyleFields =
  | 'displayDataLabel'
  | 'displayLegend'
  | 'showCenterMetric'
  | 'description'
  | 'color';

export type PieChartDataConfiguration = Omit<
  PieChartConfiguration,
  PieChartStyleFields
>;

export const extractPieChartDataConfiguration = (
  configuration: PieChartConfiguration,
  dashboardFilters: DashboardWidgetFilter[] = [],
): PieChartDataConfiguration => {
  const {
    displayDataLabel: _displayDataLabel,
    displayLegend: _displayLegend,
    showCenterMetric: _showCenterMetric,
    description: _description,
    color: _color,
    ...dataConfiguration
  } = configuration;

  return {
    ...dataConfiguration,
    filter: mergeWidgetFilters({
      widgetType: WidgetType.GRAPH,
      widgetFilter: dataConfiguration.filter,
      dashboardFilters,
    }),
  };
};
