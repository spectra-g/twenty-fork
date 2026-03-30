import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import {
  dashboardFiltersState,
  getEmptyDashboardFiltersState,
  type DashboardFiltersState,
} from '@/dashboards/states/dashboardFiltersAtom';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCallback, useEffect, useRef, useState } from 'react';

const areDashboardFiltersEqual = (
  left: DashboardFiltersState,
  right: DashboardFiltersState,
) => {
  return (
    left.pageLayoutId === right.pageLayoutId &&
    left.ownerId === right.ownerId &&
    left.ownerLabel === right.ownerLabel &&
    left.startDate === right.startDate &&
    left.endDate === right.endDate &&
    left.stage === right.stage
  );
};

export const useDashboardFilters = (pageLayoutId: string) => {
  const workspaceMembers = useAtomStateValue(currentWorkspaceMembersState);
  const [, setDashboardFilters] = useAtomState(dashboardFiltersState);
  const [filters, setFilters] = useState<DashboardFiltersState>(() =>
    getEmptyDashboardFiltersState(pageLayoutId),
  );
  const refreshCountRef = useRef(0);

  useEffect(() => {
    refreshCountRef.current = 0;
    setFilters(getEmptyDashboardFiltersState(pageLayoutId));
    setDashboardFilters(getEmptyDashboardFiltersState(pageLayoutId));

    return () => {
      refreshCountRef.current = 0;
      setDashboardFilters(getEmptyDashboardFiltersState());
    };
  }, [pageLayoutId, setDashboardFilters]);

  useEffect(() => {
    const emptyFilters = getEmptyDashboardFiltersState(pageLayoutId);

    if (areDashboardFiltersEqual(filters, emptyFilters)) {
      setDashboardFilters(emptyFilters);
      return;
    }

    refreshCountRef.current += 1;
    setDashboardFilters({
      ...filters,
      refreshCount: refreshCountRef.current,
    });
  }, [filters, pageLayoutId, setDashboardFilters]);

  const updateFilters = useCallback(
    (
      computeNextFilters: (currentFilters: DashboardFiltersState) => DashboardFiltersState,
    ) => {
      setFilters((currentFilters) => {
        const nextFilters = computeNextFilters(currentFilters);

        if (areDashboardFiltersEqual(currentFilters, nextFilters)) {
          return currentFilters;
        }

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
