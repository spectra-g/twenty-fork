import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export type FilterPreset = {
  id: string;
  name: string;
  filters: RecordFilter[];
  filterGroups: RecordFilterGroup[];
};

export type GlobalFilterConfig = {
  enabled: boolean;
  presets: FilterPreset[];
  defaultPresetId?: string;
};
