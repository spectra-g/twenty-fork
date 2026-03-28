// eslint-disable-next-line @nx/enforce-module-boundaries
import { type ChartFilter } from 'twenty-shared/types';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { isDefined } from 'twenty-shared/utils';

const COMPOSED_ROOT_GROUP_ID = 'dashboard-global-and-local-root-group';

const hasChartFilterContent = (filter: ChartFilter | undefined) =>
  isDefined(filter) &&
  ((filter.recordFilters?.length ?? 0) > 0 ||
    (filter.recordFilterGroups?.length ?? 0) > 0);

const namespaceChartFilter = ({
  filter,
  namespace,
  parentRecordFilterGroupId,
}: {
  filter: ChartFilter;
  namespace: string;
  parentRecordFilterGroupId: string;
}): ChartFilter => {
  const recordFilterGroups =
    filter.recordFilterGroups?.map((recordFilterGroup) => ({
      ...recordFilterGroup,
      id: `${namespace}-${recordFilterGroup.id}`,
      parentRecordFilterGroupId: isDefined(
        recordFilterGroup.parentRecordFilterGroupId,
      )
        ? `${namespace}-${recordFilterGroup.parentRecordFilterGroupId}`
        : parentRecordFilterGroupId,
    })) ?? [];

  const recordFilters =
    filter.recordFilters?.map((recordFilter) => ({
      ...recordFilter,
      recordFilterGroupId: isDefined(recordFilter.recordFilterGroupId)
        ? `${namespace}-${recordFilter.recordFilterGroupId}`
        : parentRecordFilterGroupId,
    })) ?? [];

  return {
    recordFilters,
    recordFilterGroups,
  };
};

export const composeChartFilters = ({
  dashboardGlobalFilters,
  localFilters,
}: {
  dashboardGlobalFilters?: ChartFilter;
  localFilters?: ChartFilter;
}): ChartFilter | undefined => {
  const hasDashboardGlobalFilters = hasChartFilterContent(
    dashboardGlobalFilters,
  );
  const hasLocalFilters = hasChartFilterContent(localFilters);

  if (!hasDashboardGlobalFilters && !hasLocalFilters) {
    return undefined;
  }

  if (!hasDashboardGlobalFilters) {
    return localFilters;
  }

  if (!hasLocalFilters) {
    return dashboardGlobalFilters;
  }

  const namespacedDashboardGlobalFilters = namespaceChartFilter({
    filter: dashboardGlobalFilters,
    namespace: 'dashboard-global',
    parentRecordFilterGroupId: COMPOSED_ROOT_GROUP_ID,
  });

  const namespacedLocalFilters = namespaceChartFilter({
    filter: localFilters,
    namespace: 'local',
    parentRecordFilterGroupId: COMPOSED_ROOT_GROUP_ID,
  });

  return {
    recordFilters: [
      ...(namespacedDashboardGlobalFilters.recordFilters ?? []),
      ...(namespacedLocalFilters.recordFilters ?? []),
    ],
    recordFilterGroups: [
      {
        id: COMPOSED_ROOT_GROUP_ID,
        logicalOperator: 'AND',
      },
      ...(namespacedDashboardGlobalFilters.recordFilterGroups ?? []),
      ...(namespacedLocalFilters.recordFilterGroups ?? []),
    ],
  };
};
