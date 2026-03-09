import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export type DashboardFilterState = {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
};

export const EMPTY_DASHBOARD_FILTER_STATE: DashboardFilterState = {
  recordFilters: [],
  recordFilterGroups: [],
};
