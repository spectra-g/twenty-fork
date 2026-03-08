import { type FilterPreset, type GlobalFilterConfig } from '@/page-layout/types/PageLayoutConfig';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const GLOBAL_FILTER_PRESET_QUERY_PARAM = 'globalFilterPresetId';

const getDefaultPresetId = (config?: GlobalFilterConfig): string | undefined => {
  if (!config || config.presets.length === 0) {
    return undefined;
  }

  if (
    config.defaultPresetId &&
    config.presets.some((preset) => preset.id === config.defaultPresetId)
  ) {
    return config.defaultPresetId;
  }

  return config.presets[0].id;
};

const getPresetById = (
  config: GlobalFilterConfig | undefined,
  presetId: string | undefined,
): FilterPreset | undefined => {
  if (!config || !presetId) {
    return undefined;
  }

  return config.presets.find((preset) => preset.id === presetId);
};

export const usePageLayoutFilters = (config?: GlobalFilterConfig) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPresetId = useMemo(() => {
    const presetIdFromQuery = searchParams.get(GLOBAL_FILTER_PRESET_QUERY_PARAM);

    if (getPresetById(config, presetIdFromQuery)) {
      return presetIdFromQuery ?? undefined;
    }

    return getDefaultPresetId(config);
  }, [config, searchParams]);

  const [activePresetId, setActivePresetId] = useState<string | undefined>(
    initialPresetId,
  );

  const [refreshKey, setRefreshKey] = useState(0);

  const activePreset = useMemo(
    () => getPresetById(config, activePresetId),
    [config, activePresetId],
  );

  const applyPreset = useCallback(
    (presetId: string) => {
      if (!getPresetById(config, presetId)) {
        return;
      }

      setActivePresetId(presetId);
      setRefreshKey((currentRefreshKey) => currentRefreshKey + 1);

      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set(GLOBAL_FILTER_PRESET_QUERY_PARAM, presetId);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [config, searchParams, setSearchParams],
  );

  return {
    activePresetId,
    activePreset,
    activeFilters: activePreset?.filters ?? [],
    activeFilterGroups: activePreset?.filterGroups ?? [],
    refreshKey,
    applyPreset,
  };
};

export const pageLayoutFilterQueryParam = GLOBAL_FILTER_PRESET_QUERY_PARAM;
