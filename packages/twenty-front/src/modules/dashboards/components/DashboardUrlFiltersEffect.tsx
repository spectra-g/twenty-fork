import { useDashboardFiltersFromQueryParams } from '@/dashboards/hooks/useDashboardFiltersFromQueryParams';
import {
  type DashboardPreset,
  useDashboardPresets,
} from '@/dashboards/hooks/useDashboardPresets';
import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { useSyncDashboardFiltersToUrl } from '@/dashboards/hooks/useSyncDashboardFiltersToUrl';
import { EMPTY_DASHBOARD_FILTERS } from '@/dashboards/states/dashboardFiltersState';
import { useEffect, useMemo, useRef } from 'react';
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

type DashboardUrlFiltersEffectProps = {
  dashboardId: string;
};

export const DashboardUrlFiltersEffect = ({
  dashboardId,
}: DashboardUrlFiltersEffectProps) => {
  const hasHydratedRef = useRef(false);
  const [searchParams] = useSearchParams();
  const filtersFromQueryParams = useDashboardFiltersFromQueryParams();
  const { presets } = useDashboardPresets();
  const { dashboardFilters, replaceDashboardFilters } =
    useDashboardFilters(dashboardId);
  const presetId = searchParams.get('presetId');
  const shouldHydrateFromExternalState =
    presetId !== null || Object.keys(filtersFromQueryParams).length > 0;

  const nextDashboardFilters = useMemo(
    () => ({
      ...EMPTY_DASHBOARD_FILTERS,
      ...getPresetFilters({
        presetId,
        presets,
      }),
      ...filtersFromQueryParams,
    }),
    [filtersFromQueryParams, presetId, presets],
  );

  useEffect(() => {
    if (!shouldHydrateFromExternalState) {
      hasHydratedRef.current = true;

      return;
    }

    if (!areDashboardFiltersEqual(dashboardFilters, nextDashboardFilters)) {
      replaceDashboardFilters(nextDashboardFilters);
    }

    hasHydratedRef.current = true;
  }, [
    dashboardFilters,
    nextDashboardFilters,
    replaceDashboardFilters,
    shouldHydrateFromExternalState,
  ]);

  useSyncDashboardFiltersToUrl(dashboardFilters, hasHydratedRef.current);

  return null;
};
