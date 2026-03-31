import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { DashboardWidgetFiltersProvider } from '@/page-layout/widgets/states/contexts/DashboardWidgetFiltersContext';
import { hasMinimalRequiredConfigForGraph } from '@/page-layout/widgets/graph/utils/hasMinimalRequiredConfigForGraph';
import { type DashboardWidgetFilter } from '@/page-layout/widgets/utils/mergeWidgetFilters';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetRendererProps = {
  widget: PageLayoutWidget;
  dashboardFilters: DashboardWidgetFilter[];
};

export const GraphWidgetRenderer = ({
  widget,
  dashboardFilters,
}: GraphWidgetRendererProps) => {
  if (
    !isDefined(widget.configuration) ||
    !isDefined(widget.objectMetadataId) ||
    !hasMinimalRequiredConfigForGraph(widget.configuration)
  ) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  return (
    <DashboardWidgetFiltersProvider dashboardFilters={dashboardFilters}>
      <GraphWidget />
    </DashboardWidgetFiltersProvider>
  );
};
