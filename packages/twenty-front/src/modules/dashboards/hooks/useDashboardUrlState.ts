import qs from 'qs';
import { useMemo } from 'react';

import { type DashboardPreset } from '@/dashboards/hooks/useDashboardPresets';
import { type DashboardStageFilter } from '@/dashboards/hooks/useDashboardFilters';
import { filterUrlQueryParamsSchema } from '@/views/schemas/filterUrlQueryParamsSchema';

const MOCK_PRESET_BY_ID: Record<string, DashboardPreset> = {
  'sales-stage-preset-123': {
    id: 'sales-stage-preset-123',
    // eslint-disable-next-line lingui/no-unlocalized-strings
    name: 'Sales View',
    stageFilter: {
      value: 'closed-won',
      // eslint-disable-next-line lingui/no-unlocalized-strings
      label: 'Closed Won',
    },
  },
  shared: {
    id: 'shared',
    // eslint-disable-next-line lingui/no-unlocalized-strings
    name: 'Shared Pipeline',
    stageFilter: {
      value: 'closed-won',
      // eslint-disable-next-line lingui/no-unlocalized-strings
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

type DashboardRawFilters = NonNullable<
  typeof filterUrlQueryParamsSchema._type.filter
>;

const EMPTY_RAW_FILTERS: DashboardRawFilters = {};

const parseRawFiltersFromSearch = (search: string): DashboardRawFilters => {
  const queryParamsValidation = filterUrlQueryParamsSchema.safeParse(
    qs.parse(search.startsWith('?') ? search.slice(1) : search),
  );

  if (!queryParamsValidation.success || !queryParamsValidation.data.filter) {
    return EMPTY_RAW_FILTERS;
  }

  return queryParamsValidation.data.filter;
};

const parseStageFilterFromRawFilters = (
  rawFilters: DashboardRawFilters,
): DashboardStageFilter | null => {
  const rawStageValue = rawFilters.stage?.eq;

  if (typeof rawStageValue !== 'string' || rawStageValue.trim() === '') {
    return null;
  }

  return {
    value: normalizeStageValue(rawStageValue),
    label: formatStageLabel(rawStageValue),
  };
};

export const resolveDashboardUrlState = ({
  search,
  presetById = MOCK_PRESET_BY_ID,
}: {
  search: string;
  presetById?: Record<string, DashboardPreset>;
}) => {
  const searchParams = new URLSearchParams(search);
  const requestedPresetId = searchParams.get('presetId')?.trim() ?? '';
  const restoredPreset = requestedPresetId
    ? presetById[requestedPresetId]
    : undefined;
  const rawFilters = parseRawFiltersFromSearch(search);
  const stageFilter =
    restoredPreset?.stageFilter ??
    parseStageFilterFromRawFilters(rawFilters) ??
    parseStageFilterFromSearchParams(searchParams);

  return {
    presetId: restoredPreset?.id ?? '',
    restoredPreset,
    rawFilters,
    stageFilter,
  };
};

export const buildDashboardUrlSearchParams = ({
  presetId,
  rawFilters = EMPTY_RAW_FILTERS,
}: {
  presetId?: string;
  rawFilters?: DashboardRawFilters;
}) => {
  const normalizedPresetId = presetId?.trim() ?? '';
  const queryString = normalizedPresetId
    ? qs.stringify({ presetId: normalizedPresetId })
    : qs.stringify({ filter: rawFilters }, { encodeValuesOnly: true });

  return new URLSearchParams(queryString);
};

type UseDashboardUrlStateProps = {
  search?: string;
};

export const useDashboardUrlState = ({
  search = window.location.search,
}: UseDashboardUrlStateProps = {}) =>
  useMemo(() => resolveDashboardUrlState({ search }), [search]);
