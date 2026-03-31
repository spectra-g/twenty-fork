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

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      data-testid="widget-refreshing"
      role="status"
    >
      Refreshing {dashboardFilters.refreshCount}
    </div>
  );
};
