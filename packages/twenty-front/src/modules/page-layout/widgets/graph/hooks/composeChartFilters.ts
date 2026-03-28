import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared/utils';

const COMPOSED_ROOT_GROUP_ID = 'dashboard-global-and-local-root-group';

const hasFilterContent = ({
  recordFilters,
  recordFilterGroups,
}: {
  recordFilters?: RecordFilter[];
  recordFilterGroups?: RecordFilterGroup[];
}) => (recordFilters?.length ?? 0) > 0 || (recordFilterGroups?.length ?? 0) > 0;

const namespaceFilters = ({
  recordFilters = [],
  recordFilterGroups = [],
  namespace,
}: {
  recordFilters?: RecordFilter[];
  recordFilterGroups?: RecordFilterGroup[];
  namespace: string;
}) => ({
  recordFilters: recordFilters.map((recordFilter) => ({
    ...recordFilter,
    recordFilterGroupId: isDefined(recordFilter.recordFilterGroupId)
      ? `${namespace}-${recordFilter.recordFilterGroupId}`
      : COMPOSED_ROOT_GROUP_ID,
  })),
  recordFilterGroups: recordFilterGroups.map((recordFilterGroup) => ({
    ...recordFilterGroup,
    id: `${namespace}-${recordFilterGroup.id}`,
    parentRecordFilterGroupId: isDefined(
      recordFilterGroup.parentRecordFilterGroupId,
    )
      ? `${namespace}-${recordFilterGroup.parentRecordFilterGroupId}`
      : COMPOSED_ROOT_GROUP_ID,
  })),
});

export const composeChartFilters = ({
  dashboardGlobalFilters,
  localFilters,
}: {
  dashboardGlobalFilters?: RecordFilter[];
  localFilters?: {
    recordFilters?: RecordFilter[];
    recordFilterGroups?: RecordFilterGroup[];
  };
}) => {
  const hasDashboardGlobalFilters = hasFilterContent({
    recordFilters: dashboardGlobalFilters,
  });
  const hasLocalFilters = hasFilterContent({
    recordFilters: localFilters?.recordFilters,
    recordFilterGroups: localFilters?.recordFilterGroups,
  });

  if (!hasDashboardGlobalFilters && !hasLocalFilters) {
    return {
      recordFilters: [],
      recordFilterGroups: [],
    };
  }

  if (!hasDashboardGlobalFilters) {
    return {
      recordFilters: localFilters?.recordFilters ?? [],
      recordFilterGroups: localFilters?.recordFilterGroups ?? [],
    };
  }

  if (!hasLocalFilters) {
    return {
      recordFilters: dashboardGlobalFilters ?? [],
      recordFilterGroups: [],
    };
  }

  const namespacedDashboardGlobalFilters = namespaceFilters({
    recordFilters: dashboardGlobalFilters,
    namespace: 'dashboard-global',
  });
  const namespacedLocalFilters = namespaceFilters({
    recordFilters: localFilters?.recordFilters,
    recordFilterGroups: localFilters?.recordFilterGroups,
    namespace: 'local',
  });

  return {
    recordFilters: [
      ...namespacedDashboardGlobalFilters.recordFilters,
      ...namespacedLocalFilters.recordFilters,
    ],
    recordFilterGroups: [
      {
        id: COMPOSED_ROOT_GROUP_ID,
        logicalOperator: 'AND',
      },
      ...namespacedDashboardGlobalFilters.recordFilterGroups,
      ...namespacedLocalFilters.recordFilterGroups,
    ],
  };
};
