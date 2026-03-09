import {
  EMPTY_DASHBOARD_FILTER_STATE,
  type DashboardFilterState,
} from '@/page-layout/types/DashboardFilterState';
import { useState } from 'react';

export const useDashboardFilters = ({
  initialState,
}: {
  initialState?: DashboardFilterState;
} = {}) => {
  const [dashboardFilterState, setDashboardFilterState] =
    useState<DashboardFilterState>(initialState ?? EMPTY_DASHBOARD_FILTER_STATE);

  return {
    dashboardFilterState,
    setDashboardFilterState,
  };
};
