import { useState } from 'react';

export type DashboardStageFilter = {
  value: string;
  label: string;
};

export const useDashboardFilters = () => {
  const [activeStageFilter, setActiveStageFilterState] =
    useState<DashboardStageFilter | null>(null);

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
