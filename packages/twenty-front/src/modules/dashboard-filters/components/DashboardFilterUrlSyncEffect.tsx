import { useDashboardFilterUrlState } from '@/dashboard-filters/hooks/useDashboardFilterUrlState';
import { useHydrateDashboardFiltersFromUrl } from '@/dashboard-filters/hooks/useHydrateDashboardFiltersFromUrl';

export const DashboardFilterUrlSyncEffect = () => {
  const { hasHydratedFromUrl } = useHydrateDashboardFiltersFromUrl();

  useDashboardFilterUrlState({
    isEnabled: hasHydratedFromUrl,
  });

  return null;
};
