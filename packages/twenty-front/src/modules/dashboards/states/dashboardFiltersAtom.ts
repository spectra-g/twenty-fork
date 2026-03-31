import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type DashboardFiltersState = {
  pageLayoutId: string | null;
  ownerId: string | null;
  ownerLabel: string | null;
  startDate: string | null;
  endDate: string | null;
  stage: string | null;
  refreshCount: number;
};

export const getEmptyDashboardFiltersState = (
  pageLayoutId: string | null = null,
): DashboardFiltersState => ({
  pageLayoutId,
  ownerId: null,
  ownerLabel: null,
  startDate: null,
  endDate: null,
  stage: null,
  refreshCount: 0,
});

export const dashboardFiltersState = createAtomState<DashboardFiltersState>({
  key: 'dashboardFiltersState',
  defaultValue: getEmptyDashboardFiltersState(),
});
