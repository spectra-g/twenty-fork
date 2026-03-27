import { useState } from 'react';

export type DashboardStageFilter = {
  value: string;
  label: string;
};

export const useDashboardFilters = (
  initialStageFilter: DashboardStageFilter | null = null,
) => {
  const [activeStageFilter, setActiveStageFilterState] =
    useState<DashboardStageFilter | null>(initialStageFilter);

  const setActiveStageFilter = (stageFilter: DashboardStageFilter) => {
    setActiveStageFilterState(stageFilter);
  };

  const clearActiveStageFilter = () => {
    setActiveStageFilterState(null);
  };

  return {
    activeStageFilter,
    setActiveStageFilter,
    clearActiveStageFilter,
  };
};
