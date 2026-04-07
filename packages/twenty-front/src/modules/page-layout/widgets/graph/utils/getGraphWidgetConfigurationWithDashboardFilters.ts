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
  // @clawdence-stub: STORY-121 - Implement AND merge of dashboard filters with widget-local filters before GraphQL query
  return {
    ...configuration,
    filter: dashboardFilters,
  };
};
