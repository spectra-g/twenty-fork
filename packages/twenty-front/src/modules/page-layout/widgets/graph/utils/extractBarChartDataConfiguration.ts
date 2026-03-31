import {
  WidgetType,
  type BarChartConfiguration,
} from '~/generated-metadata/graphql';

import {
  type DashboardWidgetFilter,
  mergeWidgetFilters,
} from '@/page-layout/widgets/utils/mergeWidgetFilters';

type BarChartStyleFields =
  | 'displayDataLabel'
  | 'displayLegend'
  | 'axisNameDisplay'
  | 'description'
  | 'color';

export type BarChartDataConfiguration = Omit<
  BarChartConfiguration,
  BarChartStyleFields
>;

export const extractBarChartDataConfiguration = (
  configuration: BarChartConfiguration,
  dashboardFilters: DashboardWidgetFilter[] = [],
): BarChartDataConfiguration => {
  const {
    displayDataLabel: _displayDataLabel,
    displayLegend: _displayLegend,
    axisNameDisplay: _axisNameDisplay,
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
