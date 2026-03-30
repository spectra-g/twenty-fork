import { dashboardFiltersState } from '@/dashboards/states/dashboardFiltersAtom';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type DashboardFilterRefreshIndicatorProps = {
  pageLayoutId: string;
};

export const DashboardFilterRefreshIndicator = ({
  pageLayoutId,
}: DashboardFilterRefreshIndicatorProps) => {
  const dashboardFilters = useAtomStateValue(dashboardFiltersState);

  if (
    dashboardFilters.pageLayoutId !== pageLayoutId ||
    dashboardFilters.refreshCount === 0
  ) {
    return null;
  }

  // @clawdence-stub: STORY-090 - Widgets subscribe to dashboard filters, but this story only exposes the refresh contract.
  return (
    <div data-testid="widget-refreshing">
      Refreshing {dashboardFilters.refreshCount}
    </div>
  );
};
