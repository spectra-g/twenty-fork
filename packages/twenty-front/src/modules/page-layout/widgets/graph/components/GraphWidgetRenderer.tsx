import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { GraphWidgetFilterPills } from '@/page-layout/widgets/graph/components/GraphWidgetFilterPills';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { hasMinimalRequiredConfigForGraph } from '@/page-layout/widgets/graph/utils/hasMinimalRequiredConfigForGraph';

type GraphWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetRenderer = ({ widget }: GraphWidgetRendererProps) => {
  if (
    !widget.configuration ||
    !widget.objectMetadataId ||
    !hasMinimalRequiredConfigForGraph(widget.configuration)
  ) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  return (
    <>
      <GraphWidgetFilterPills widget={widget} />
      <GraphWidget />
    </>
  );
};
