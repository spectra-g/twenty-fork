import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useDashboardFiltersFromQueryParams } from '@/dashboards/hooks/useDashboardFiltersFromQueryParams';
import {
  getEmptyDashboardFiltersState,
  type DashboardFiltersState,
} from '@/dashboards/states/dashboardFiltersAtom';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useDashboardFilters = (pageLayoutId: string) => {
  const workspaceMembers = useAtomStateValue(currentWorkspaceMembersState);
  const { dashboardFiltersFromQueryParams } = useDashboardFiltersFromQueryParams();

  const initialFilters = useMemo(() => {
    const emptyDashboardFilters = getEmptyDashboardFiltersState(pageLayoutId);

    if (dashboardFiltersFromQueryParams === null) {
      return emptyDashboardFilters;
    }

    const selectedWorkspaceMember =
      dashboardFiltersFromQueryParams.ownerId === null
        ? null
        : workspaceMembers.find(
            (workspaceMember) =>
              workspaceMember.id === dashboardFiltersFromQueryParams.ownerId,
          );

    const ownerLabel =
      selectedWorkspaceMember === undefined || selectedWorkspaceMember === null
        ? null
        : `${selectedWorkspaceMember.name.firstName} ${selectedWorkspaceMember.name.lastName}`.trim();

    return {
      ...emptyDashboardFilters,
      ownerId: dashboardFiltersFromQueryParams.ownerId,
      ownerLabel,
      startDate: dashboardFiltersFromQueryParams.startDate,
      endDate: dashboardFiltersFromQueryParams.endDate,
      stage: dashboardFiltersFromQueryParams.stage,
    };
  }, [
    dashboardFiltersFromQueryParams?.endDate,
    dashboardFiltersFromQueryParams?.ownerId,
    dashboardFiltersFromQueryParams?.stage,
    dashboardFiltersFromQueryParams?.startDate,
    pageLayoutId,
    workspaceMembers,
  ]);

  const [filters, setFilters] = useState<DashboardFiltersState>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const updateFilters = useCallback(
    (
      computeNextFilters: (currentFilters: DashboardFiltersState) => DashboardFiltersState,
    ) => {
      setFilters((currentFilters) => {
        const nextFilters = computeNextFilters(currentFilters);
        return nextFilters;
      });
    },
    [],
  );

  const setOwnerId = useCallback(
    (ownerId: string) => {
      updateFilters((currentFilters) => {
        const selectedWorkspaceMember = workspaceMembers.find(
          (workspaceMember) => workspaceMember.id === ownerId,
        );
        const ownerLabel = selectedWorkspaceMember
          ? `${selectedWorkspaceMember.name.firstName} ${selectedWorkspaceMember.name.lastName}`.trim()
          : null;

        return {
          ...currentFilters,
          pageLayoutId,
          ownerId: ownerId === '' ? null : ownerId,
          ownerLabel,
        };
      });
    },
    [pageLayoutId, updateFilters, workspaceMembers],
  );

  const setStartDate = useCallback(
    (startDate: string) => {
      updateFilters((currentFilters) => ({
        ...currentFilters,
        pageLayoutId,
        startDate: startDate === '' ? null : startDate,
      }));
    },
    [pageLayoutId, updateFilters],
  );

  const setEndDate = useCallback(
    (endDate: string) => {
      updateFilters((currentFilters) => ({
        ...currentFilters,
        pageLayoutId,
        endDate: endDate === '' ? null : endDate,
      }));
    },
    [pageLayoutId, updateFilters],
  );

  const setStage = useCallback(
    (stage: string) => {
      updateFilters((currentFilters) => ({
        ...currentFilters,
        pageLayoutId,
        stage: stage === '' ? null : stage,
      }));
    },
    [pageLayoutId, updateFilters],
  );

  return {
    filters,
    setOwnerId,
    setStartDate,
    setEndDate,
    setStage,
  };
};
