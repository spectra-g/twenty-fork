import { useState } from 'react';

import { type DashboardStageFilter } from '@/dashboards/hooks/useDashboardFilters';

export type DashboardPreset = {
  id: string;
  name: string;
  stageFilter: DashboardStageFilter;
};

const createPresetId = (presetName: string) =>
  presetName.trim().toLowerCase().replace(/\s+/g, '-');

type UseDashboardPresetsProps = {
  initialPresets?: DashboardPreset[];
  initialSelectedPresetId?: string;
};

export const useDashboardPresets = ({
  initialPresets = [],
  initialSelectedPresetId,
}: UseDashboardPresetsProps = {}) => {
  const [presets, setPresets] = useState<DashboardPreset[]>(initialPresets);
  const [selectedPresetId, setSelectedPresetId] = useState(
    initialSelectedPresetId ?? '',
  );

  const savePreset = ({
    presetName,
    stageFilter,
  }: {
    presetName: string;
    stageFilter: DashboardStageFilter;
  }) => {
    const presetId = createPresetId(presetName);
    const nextPreset = {
      id: presetId,
      name: presetName,
      stageFilter,
    };

    setPresets((currentPresets) => [...currentPresets, nextPreset]);
    setSelectedPresetId(presetId);

    return nextPreset;
  };

  const renamePreset = ({
    presetId,
    presetName,
  }: {
    presetId: string;
    presetName: string;
  }) => {
    setPresets((currentPresets) =>
      currentPresets.map((preset) =>
        preset.id === presetId
          ? {
              ...preset,
              name: presetName,
            }
          : preset,
      ),
    );
  };

  const selectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
  };

  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId);

  return {
    presets,
    savePreset,
    renamePreset,
    selectPreset,
    selectedPresetId,
    selectedPreset,
  };
};
