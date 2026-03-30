import { type DashboardFilters } from '@/dashboards/states/dashboardFiltersState';
import { useEffect, useState } from 'react';

export const DASHBOARD_PRESETS_LOADING_DELAY_MS = 2000;

export type DashboardPreset = {
  id: string;
  filterState: Partial<DashboardFilters>;
};

export const useDashboardPresets = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoading(false);
    }, DASHBOARD_PRESETS_LOADING_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return {
    presets: [] as DashboardPreset[],
    loading,
  };
};
