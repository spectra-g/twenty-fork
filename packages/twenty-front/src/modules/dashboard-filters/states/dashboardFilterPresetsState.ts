import { type DashboardFilters } from '@/dashboard-filters/states/dashboardFilterState';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type DashboardFilterPreset = {
  id: string;
  name: string;
  filters: DashboardFilters;
};

export const getDashboardFilterPresetScopeKey = ({
  workspaceId,
  dashboardId,
  userId,
}: {
  workspaceId: string;
  dashboardId: string;
  userId: string;
}) => `${workspaceId}:${dashboardId}:${userId}`;

export const dashboardFilterPresetsState = createAtomState<
  Record<string, DashboardFilterPreset[]>
>({
  key: 'dashboardFilterPresetsState',
  defaultValue: {},
  useLocalStorage: true,
});
