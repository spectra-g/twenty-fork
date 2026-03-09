import { dashboardFilterQueryParamsSchema } from '@/page-layout/schemas/dashboardFilterQueryParamsSchema';
import {
  EMPTY_DASHBOARD_FILTER_STATE,
  type DashboardFilterState,
} from '@/page-layout/types/DashboardFilterState';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import z from 'zod';

const dashboardFilterStateSchema = z.object({
  recordFilters: z.array(z.any()),
  recordFilterGroups: z.array(z.any()),
});

const MAX_URL_LENGTH = 2048;

export const useDashboardFilterUrlSync = ({
  dashboardFilterState,
  setDashboardFilterState,
  enabled,
}: {
  dashboardFilterState: DashboardFilterState;
  setDashboardFilterState: (next: DashboardFilterState) => void;
  enabled: boolean;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasHydratedFromUrlRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      hasHydratedFromUrlRef.current = true;
      return;
    }

    const validationResult = dashboardFilterQueryParamsSchema.safeParse(
      Object.fromEntries(searchParams.entries()),
    );

    if (!validationResult.success) {
      hasHydratedFromUrlRef.current = true;
      return;
    }

    const encodedDashboardFilters = validationResult.data.dashboardFilters;

    if (!encodedDashboardFilters) {
      hasHydratedFromUrlRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(encodedDashboardFilters);
      const parsedState = dashboardFilterStateSchema.safeParse(parsed);

      if (parsedState.success) {
        setDashboardFilterState({
          recordFilters: parsedState.data.recordFilters,
          recordFilterGroups: parsedState.data.recordFilterGroups,
        });
      }
    } catch {
      // Ignore invalid query-parameter payloads.
    }

    hasHydratedFromUrlRef.current = true;
  }, [enabled, searchParams, setDashboardFilterState]);

  useEffect(() => {
    if (!enabled || !hasHydratedFromUrlRef.current) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);

    const hasFiltersToSync =
      dashboardFilterState.recordFilters.length > 0 ||
      dashboardFilterState.recordFilterGroups.length > 0;

    if (!hasFiltersToSync) {
      nextSearchParams.delete('dashboardFilters');
      setSearchParams(nextSearchParams, { replace: true });
      return;
    }

    const serializedDashboardFilters = JSON.stringify(dashboardFilterState);

    nextSearchParams.set('dashboardFilters', serializedDashboardFilters);

    if (nextSearchParams.toString().length > MAX_URL_LENGTH) {
      nextSearchParams.delete('dashboardFilters');
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [dashboardFilterState, enabled, searchParams, setSearchParams]);

  return {
    dashboardFilterState: enabled
      ? dashboardFilterState
      : EMPTY_DASHBOARD_FILTER_STATE,
  };
};
