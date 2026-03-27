import { useState } from 'react';

import { type DashboardFilterVariable } from '@/dashboards/contexts/DashboardFiltersContext';

export type DashboardFilterType = 'date' | 'owner' | 'stage';

export type DashboardStageFilter = {
  value: string;
  label: string;
};

export type DashboardFilterValue = {
  id: string;
  fieldMetadataId: string;
  type: DashboardFilterType;
  label: string;
  operand: string;
  value: string;
  displayValue: string;
};

export type DashboardFiltersState = {
  activeStageFilter: DashboardStageFilter | null;
  activeDashboardFilters: DashboardFilterValue[];
  dashboardFilters: DashboardFilterVariable[];
  setActiveStageFilter: (stageFilter: DashboardStageFilter) => void;
  clearActiveStageFilter: () => void;
  setDashboardFilter: (dashboardFilter: DashboardFilterValue) => void;
  clearDashboardFilter: (filterId: string) => void;
};

export const useDashboardFilters = (
  initialStageFilter: DashboardStageFilter | null = null,
): DashboardFiltersState => {
  const [activeStageFilter, setActiveStageFilterState] =
    useState<DashboardStageFilter | null>(initialStageFilter);
  const [activeDashboardFilters, setActiveDashboardFilters] = useState<
    DashboardFilterValue[]
  >([]);

  const setActiveStageFilter = (stageFilter: DashboardStageFilter) => {
    setActiveStageFilterState(stageFilter);
  };

  const clearActiveStageFilter = () => {
    setActiveStageFilterState(null);
  };

  const setDashboardFilter = (dashboardFilter: DashboardFilterValue) => {
    setActiveDashboardFilters((currentDashboardFilters) => {
      const nextDashboardFilters = currentDashboardFilters.filter(
        (currentDashboardFilter) =>
          currentDashboardFilter.id !== dashboardFilter.id,
      );

      return [...nextDashboardFilters, dashboardFilter];
    });
  };

  const clearDashboardFilter = (filterId: string) => {
    setActiveDashboardFilters((currentDashboardFilters) =>
      currentDashboardFilters.filter(
        (dashboardFilter) => dashboardFilter.id !== filterId,
      ),
    );
  };

  const dashboardFilters: DashboardFilterVariable[] =
    activeDashboardFilters.map((dashboardFilter) => ({
      fieldMetadataId: dashboardFilter.fieldMetadataId,
      operand: dashboardFilter.operand,
      value: dashboardFilter.value,
    }));

  return {
    activeStageFilter,
    activeDashboardFilters,
    dashboardFilters,
    setActiveStageFilter,
    clearActiveStageFilter,
    setDashboardFilter,
    clearDashboardFilter,
  };
};
