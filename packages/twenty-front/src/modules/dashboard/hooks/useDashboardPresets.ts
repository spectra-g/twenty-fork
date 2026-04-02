import { useCallback, useContext } from 'react';

import { DashboardFilterContext } from '@/dashboard/contexts/DashboardFilterContext';

export const useDashboardPresets = () => {
  const {
    globalFilters,
    globalFilterGroups,
    presets,
    setGlobalFilters,
    setGlobalFilterGroups,
    setPresets,
  } = useContext(DashboardFilterContext);

  const savePreset = useCallback(
    (name: string) => {
      const trimmedName = name.trim();

      if (trimmedName.length === 0) {
        return;
      }

      const timestamp = new Date().toISOString();
      const presetId = `dashboard-preset-${crypto.randomUUID()}`;

      setPresets((currentPresets) => [
        {
          id: presetId,
          name: trimmedName,
          filters: globalFilters,
          filterGroups: globalFilterGroups,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        ...currentPresets,
      ]);
    },
    [globalFilterGroups, globalFilters, setPresets],
  );

  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = presets.find(
        (currentPreset) => currentPreset.id === presetId,
      );

      if (!preset) {
        return;
      }

      setGlobalFilters(preset.filters);
      setGlobalFilterGroups(preset.filterGroups);
    },
    [presets, setGlobalFilterGroups, setGlobalFilters],
  );

  const renamePreset = useCallback(
    (presetId: string, name: string) => {
      const trimmedName = name.trim();

      if (trimmedName.length === 0) {
        return;
      }

      setPresets((currentPresets) =>
        currentPresets.map((preset) =>
          preset.id === presetId
            ? {
                ...preset,
                name: trimmedName,
                updatedAt: new Date().toISOString(),
              }
            : preset,
        ),
      );
    },
    [setPresets],
  );

  const deletePreset = useCallback(
    (presetId: string) => {
      setPresets((currentPresets) =>
        currentPresets.filter((preset) => preset.id !== presetId),
      );
    },
    [setPresets],
  );

  return {
    applyPreset,
    deletePreset,
    presets,
    renamePreset,
    savePreset,
  };
};
