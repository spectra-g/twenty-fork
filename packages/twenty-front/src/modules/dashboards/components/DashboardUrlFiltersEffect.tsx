import { useDashboardFiltersFromQueryParams } from '@/dashboards/hooks/useDashboardFiltersFromQueryParams';
import {
  type DashboardPreset,
  useDashboardPresets,
} from '@/dashboards/hooks/useDashboardPresets';
import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { useSyncDashboardFiltersToUrl } from '@/dashboards/hooks/useSyncDashboardFiltersToUrl';
import { EMPTY_DASHBOARD_FILTERS } from '@/dashboards/states/dashboardFiltersState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const areDashboardFiltersEqual = (
  leftDashboardFilters: typeof EMPTY_DASHBOARD_FILTERS,
  rightDashboardFilters: typeof EMPTY_DASHBOARD_FILTERS,
) =>
  leftDashboardFilters.ownerId === rightDashboardFilters.ownerId &&
  leftDashboardFilters.dateRange === rightDashboardFilters.dateRange &&
  leftDashboardFilters.stageId === rightDashboardFilters.stageId;

const getPresetFilters = ({
  presetId,
  presets,
}: {
  presetId: string | null;
  presets: DashboardPreset[];
}) => {
  if (presetId === null) {
    return {};
  }

  return presets.find((preset) => preset.id === presetId)?.filterState ?? {};
};

const removeDashboardFilterQueryParams = (searchParams: URLSearchParams) => {
  Array.from(searchParams.keys())
    .filter((key) => key.startsWith('filter['))
    .forEach((key) => {
      searchParams.delete(key);
    });
};

type DashboardUrlFiltersEffectProps = {
  dashboardId: string;
};

export const DashboardUrlFiltersEffect = ({
  dashboardId,
}: DashboardUrlFiltersEffectProps) => {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [lastCleanedInvalidSearchParams, setLastCleanedInvalidSearchParams] =
    useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { dashboardFiltersFromQueryParams, hasInvalidFilterQueryParams } =
    useDashboardFiltersFromQueryParams();
  const { presets, loading } = useDashboardPresets();
  const { dashboardFilters, replaceDashboardFilters } =
    useDashboardFilters(dashboardId);
  const { enqueueErrorSnackBar } = useSnackBar();
  const searchParamsString = searchParams.toString();
  const presetId = searchParams.get('presetId');
  const hasMissingPreset =
    presetId !== null &&
    !loading &&
    !presets.some((preset) => preset.id === presetId);
  const shouldHydrateFromExternalState =
    (!hasMissingPreset && presetId !== null) ||
    Object.keys(dashboardFiltersFromQueryParams).length > 0;
  const hasInvalidExternalState =
    hasInvalidFilterQueryParams || hasMissingPreset;

  const nextDashboardFilters = useMemo(
    () => ({
      ...EMPTY_DASHBOARD_FILTERS,
      ...getPresetFilters({
        presetId,
        presets,
      }),
      ...dashboardFiltersFromQueryParams,
    }),
    [dashboardFiltersFromQueryParams, presetId, presets],
  );

  useEffect(() => {
    if (
      !hasInvalidExternalState ||
      lastCleanedInvalidSearchParams === searchParamsString
    ) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);

    if (hasInvalidFilterQueryParams) {
      removeDashboardFilterQueryParams(nextSearchParams);
    }

    if (hasMissingPreset) {
      nextSearchParams.delete('presetId');
    }

    enqueueErrorSnackBar({
      message: t`Shared filters could not be applied`,
      options: {
        dedupeKey: 'dashboard-invalid-shared-filters',
      },
    });
    setSearchParams(nextSearchParams, { replace: true });
    setLastCleanedInvalidSearchParams(searchParamsString);
  }, [
    enqueueErrorSnackBar,
    hasInvalidExternalState,
    hasInvalidFilterQueryParams,
    hasMissingPreset,
    lastCleanedInvalidSearchParams,
    searchParams,
    searchParamsString,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!shouldHydrateFromExternalState) {
      setHasHydrated(true);

      return;
    }

    if (!areDashboardFiltersEqual(dashboardFilters, nextDashboardFilters)) {
      replaceDashboardFilters(nextDashboardFilters);
    }

    setHasHydrated(true);
  }, [
    dashboardFilters,
    nextDashboardFilters,
    replaceDashboardFilters,
    shouldHydrateFromExternalState,
  ]);

  useSyncDashboardFiltersToUrl(dashboardFilters, hasHydrated);

  return null;
};
