import {
  WidgetType,
  type LineChartConfiguration,
} from '~/generated-metadata/graphql';

import {
  type DashboardWidgetFilter,
  mergeWidgetFilters,
} from '@/page-layout/widgets/utils/mergeWidgetFilters';

type LineChartStyleFields =
  | 'displayDataLabel'
  | 'displayLegend'
  | 'axisNameDisplay'
  | 'description'
  | 'color';

export type LineChartDataConfiguration = Omit<
  LineChartConfiguration,
  LineChartStyleFields
>;

export const extractLineChartDataConfiguration = (
  configuration: LineChartConfiguration,
  dashboardFilters: DashboardWidgetFilter[] = [],
): LineChartDataConfiguration => {
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
