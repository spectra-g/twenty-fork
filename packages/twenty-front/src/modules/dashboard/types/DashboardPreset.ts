import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

export type DashboardPreset = {
  id: string;
  name: string;
  filters: RecordFilter[];
  filterGroups: RecordFilterGroup[];
  createdAt: string;
  updatedAt: string;
};
