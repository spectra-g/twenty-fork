import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const DEFAULT_DASHBOARD_FILTER_FIELD_METADATA_ID = 'name';

const createDefaultDashboardFilter = (
  nextFilterNumber: number,
): RecordFilter => ({
  id: `dashboard-filter-${nextFilterNumber}`,
  fieldMetadataId: DEFAULT_DASHBOARD_FILTER_FIELD_METADATA_ID,
  value: '',
  displayValue: '',
  operand: RecordFilterOperand.CONTAINS,
  type: FieldMetadataType.TEXT,
  label: 'Name',
});

export const useDashboardFilters = () => {
  const dashboardFilters = useAtomComponentStateValue(
    dashboardFiltersComponentState,
  );

  const setDashboardFilters = useSetAtomComponentState(
    dashboardFiltersComponentState,
  );

  const addDashboardFilter = () => {
    const nextFilter = createDefaultDashboardFilter(dashboardFilters.length + 1);

    setDashboardFilters((currentDashboardFilters) => [
      ...currentDashboardFilters,
      nextFilter,
    ]);

    return nextFilter;
  };

  const updateDashboardFilter = (
    filterId: string,
    updates: Partial<RecordFilter>,
  ) => {
    setDashboardFilters((currentDashboardFilters) =>
      currentDashboardFilters.map((dashboardFilter) =>
        dashboardFilter.id === filterId
          ? {
              ...dashboardFilter,
              ...updates,
            }
          : dashboardFilter,
      ),
    );
  };

  return {
    dashboardFilters,
    addDashboardFilter,
    updateDashboardFilter,
  };
};
