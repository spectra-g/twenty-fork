import { isDefined } from 'twenty-shared/utils';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type DashboardFilters } from '@/dashboard-filters/states/dashboardFilterState';
import {
  dashboardFilterPresetsState,
  getDashboardFilterPresetScopeKey,
  type DashboardFilterPreset,
} from '@/dashboard-filters/states/dashboardFilterPresetsState';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const generateDashboardFilterPresetId = () =>
  `dashboard-filter-preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getTrimmedPresetName = (name: string) => name.trim();

export const useDashboardFilterPresets = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { currentPageLayout } = useCurrentPageLayout();
  const [dashboardFilterPresets, setDashboardFilterPresets] = useAtomState(
    dashboardFilterPresetsState,
  );

  const scopeKey =
    isDefined(currentUser?.id) &&
    isDefined(currentWorkspace?.id) &&
    isDefined(currentPageLayout?.id)
      ? getDashboardFilterPresetScopeKey({
          workspaceId: currentWorkspace.id,
          dashboardId: currentPageLayout.id,
          userId: currentUser.id,
        })
      : null;

  const presets = scopeKey ? (dashboardFilterPresets[scopeKey] ?? []) : [];

  const savePreset = ({
    name,
    filters,
  }: {
    name: string;
    filters: DashboardFilters;
  }) => {
    const trimmedName = getTrimmedPresetName(name);

    if (!scopeKey || trimmedName.length === 0) {
      return;
    }

    const nextPreset: DashboardFilterPreset = {
      id: generateDashboardFilterPresetId(),
      name: trimmedName,
      filters,
    };

    setDashboardFilterPresets((currentDashboardFilterPresets) => ({
      ...currentDashboardFilterPresets,
      [scopeKey]: [
        ...(currentDashboardFilterPresets[scopeKey] ?? []),
        nextPreset,
      ],
    }));
  };

  const renamePreset = (presetId: string, nextName: string) => {
    const trimmedName = getTrimmedPresetName(nextName);

    if (!scopeKey || trimmedName.length === 0) {
      return;
    }

    setDashboardFilterPresets((currentDashboardFilterPresets) => ({
      ...currentDashboardFilterPresets,
      [scopeKey]: (currentDashboardFilterPresets[scopeKey] ?? []).map(
        (preset) =>
          preset.id === presetId ? { ...preset, name: trimmedName } : preset,
      ),
    }));
  };

  const applyPreset = (presetId: string) =>
    presets.find((preset) => preset.id === presetId)?.filters;

  return {
    presets,
    savePreset,
    renamePreset,
    applyPreset,
  };
};
