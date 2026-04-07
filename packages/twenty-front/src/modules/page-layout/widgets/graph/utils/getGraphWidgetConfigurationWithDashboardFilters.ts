import { type ChartFilter } from 'twenty-shared/types';

type GraphWidgetConfigurationWithFilter = {
  filter?: ChartFilter | null;
};

export const getGraphWidgetConfigurationWithDashboardFilters = <
  TConfiguration extends GraphWidgetConfigurationWithFilter,
>(
  configuration: TConfiguration,
  dashboardFilters: ChartFilter,
): TConfiguration => {
  const widgetFilters = configuration.filter;
  const mergedRecordFilters = [
    ...(widgetFilters?.recordFilters ?? []),
    ...(dashboardFilters.recordFilters ?? []),
  ];
  const mergedRecordFilterGroups = [
    ...(widgetFilters?.recordFilterGroups ?? []),
    ...(dashboardFilters.recordFilterGroups ?? []),
  ];

  return {
    ...configuration,
    filter: {
      recordFilters: mergedRecordFilters,
      recordFilterGroups: mergedRecordFilterGroups,
    },
  };
};
