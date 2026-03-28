import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect, useMemo, useState } from 'react';

const DASHBOARD_PRESETS_STORAGE_KEY = 'preset-dashboard-filter-presets';

export type DashboardFilterPreset = {
  id: string;
  name: string;
  filters: RecordFilter[];
};

const cloneFilters = (filters: RecordFilter[]) =>
  filters.map((filter) => ({ ...filter }));

const readPresetsFromLocalStorage = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const presets = window.localStorage.getItem(DASHBOARD_PRESETS_STORAGE_KEY);

    return presets ? (JSON.parse(presets) as DashboardFilterPreset[]) : [];
  } catch {
    return [];
  }
};

export const useDashboardPresetsMock = ({
  dashboardId,
}: {
  dashboardId: string;
}) => {
  const dashboardFilters = useAtomComponentStateValue(
    dashboardFiltersComponentState,
  );
  const setDashboardFilters = useSetAtomComponentState(
    dashboardFiltersComponentState,
  );
  const [presets, setPresets] = useState<DashboardFilterPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  useEffect(() => {
    setPresets(readPresetsFromLocalStorage());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      DASHBOARD_PRESETS_STORAGE_KEY,
      JSON.stringify(presets),
    );
  }, [presets]);

  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === activePresetId) ?? null,
    [activePresetId, presets],
  );

  const savePreset = (name: string) => {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return null;
    }

    const preset: DashboardFilterPreset = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `dashboard-preset-${Date.now()}`,
      name: trimmedName,
      filters: cloneFilters(dashboardFilters),
    };

    setPresets((currentPresets) => [...currentPresets, preset]);
    setActivePresetId(preset.id);

    console.log('Mock dashboard preset save', {
      dashboardId,
      presetName: trimmedName,
    });

    return preset;
  };

  const applyPreset = (presetId: string) => {
    const preset =
      presets.find((currentPreset) => currentPreset.id === presetId) ?? null;

    if (preset === null) {
      return;
    }

    setDashboardFilters(cloneFilters(preset.filters));
    setActivePresetId(preset.id);
  };

  const updatePreset = (presetId: string) => {
    console.log('Mock dashboard preset update', {
      dashboardId,
      presetId,
    });
  };

  return {
    activePreset,
    applyPreset,
    presets,
    savePreset,
    updatePreset,
  };
};
