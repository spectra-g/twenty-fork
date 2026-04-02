import { useContext } from 'react';

import { DashboardFilterContext } from '@/dashboard/contexts/DashboardFilterContext';

export const useDashboardFilters = () => {
  return useContext(DashboardFilterContext);
};
