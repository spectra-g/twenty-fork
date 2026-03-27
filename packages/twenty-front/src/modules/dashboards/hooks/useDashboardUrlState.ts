import { useMemo } from 'react';

import { type DashboardPreset } from '@/dashboards/hooks/useDashboardPresets';
import { type DashboardStageFilter } from '@/dashboards/hooks/useDashboardFilters';

const MOCK_PRESET_BY_ID: Record<string, DashboardPreset> = {
  'sales-stage-preset-123': {
    id: 'sales-stage-preset-123',
    name: 'Sales View',
    stageFilter: {
      value: 'closed-won',
      label: 'Closed Won',
    },
  },
};

const normalizeStageValue = (value: string) => value.trim().toLowerCase();

const formatStageLabel = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const parseStageFilterFromSearchParams = (
  searchParams: URLSearchParams,
): DashboardStageFilter | null => {
  const rawStageValue = searchParams.get('filter[stage][eq]');

  if (!rawStageValue) {
    return null;
  }

  return {
    value: normalizeStageValue(rawStageValue),
    label: formatStageLabel(rawStageValue),
  };
};

type UseDashboardUrlStateProps = {
  search?: string;
};

export const useDashboardUrlState = ({
  search = window.location.search,
}: UseDashboardUrlStateProps = {}) =>
  useMemo(() => {
    const searchParams = new URLSearchParams(search);
    const presetId = searchParams.get('presetId') ?? '';
    const restoredPreset = presetId ? MOCK_PRESET_BY_ID[presetId] : undefined;
    const stageFilter =
      restoredPreset?.stageFilter ?? parseStageFilterFromSearchParams(searchParams);

    return {
      presetId,
      restoredPreset,
      stageFilter,
    };
  }, [search]);
