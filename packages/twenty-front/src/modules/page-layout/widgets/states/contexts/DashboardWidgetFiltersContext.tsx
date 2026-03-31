import {
  createContext,
  type ReactNode,
  useContext,
} from 'react';

import { type DashboardWidgetFilter } from '@/page-layout/widgets/utils/mergeWidgetFilters';

const DashboardWidgetFiltersContext = createContext<DashboardWidgetFilter[]>([]);

export const DashboardWidgetFiltersProvider = ({
  children,
  dashboardFilters,
}: {
  children: ReactNode;
  dashboardFilters: DashboardWidgetFilter[];
}) => (
  <DashboardWidgetFiltersContext.Provider value={dashboardFilters}>
    {children}
  </DashboardWidgetFiltersContext.Provider>
);

export const useDashboardWidgetFilters = () =>
  useContext(DashboardWidgetFiltersContext);
