/* eslint-disable @nx/enforce-module-boundaries */
import { useEffect, useState } from 'react';
import { type ChartFilter } from 'twenty-shared/types';

import {
  type DashboardPreset,
  useDashboardPresetsApi,
} from '@/page-layout/hooks/useDashboardPresetsApi';

export const useDashboardPresets = (dashboardId: string) => {
  const {
    createDashboardPreset,
    renameDashboardPreset,
    deleteDashboardPreset,
    listDashboardPresets,
  } = useDashboardPresetsApi(dashboardId);
  const [presets, setPresets] = useState<DashboardPreset[]>([]);

  useEffect(() => {
    const loadDashboardPresets = async () => {
      const nextPresets = await listDashboardPresets(dashboardId);
      setPresets(nextPresets);
    };

    void loadDashboardPresets();
  }, [dashboardId, listDashboardPresets]);

  const savePreset = async (name: string, filterState: ChartFilter) => {
    const createdPreset = await createDashboardPreset(name, filterState);

    setPresets((currentPresets) => [...currentPresets, createdPreset]);
  };

  const renamePreset = async (id: string, name: string) => {
    const renamedPreset = await renameDashboardPreset(id, name);

    setPresets((currentPresets) =>
      currentPresets.map((preset) =>
        preset.id === id ? { ...preset, name: renamedPreset.name } : preset,
      ),
    );
  };

  const removePreset = async (id: string) => {
    const wasDeleted = await deleteDashboardPreset(id);

    if (!wasDeleted) {
      return;
    }

    setPresets((currentPresets) =>
      currentPresets.filter((preset) => preset.id !== id),
    );
  };

  return {
    presets,
    savePreset,
    renamePreset,
    removePreset,
  };
};
