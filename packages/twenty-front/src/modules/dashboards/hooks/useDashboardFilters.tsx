import { type PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

type DashboardFiltersState = {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
  isPresetModified: boolean;
  addFilter: (filter: RecordFilter) => void;
  removeFilter: (recordFilterId: string) => void;
  updateFilter: (
    recordFilterId: string,
    updates: Partial<RecordFilter>,
  ) => void;
  resetFilters: () => void;
  replaceAllFilters: (params: {
    recordFilters: RecordFilter[];
    recordFilterGroups: RecordFilterGroup[];
  }) => void;
};

const noop = () => {
  return;
};

const defaultState: DashboardFiltersState = {
  recordFilters: [],
  recordFilterGroups: [],
  isPresetModified: false,
  addFilter: noop,
  removeFilter: noop,
  updateFilter: noop,
  resetFilters: noop,
  replaceAllFilters: noop,
};

const DashboardFiltersContext = createContext<DashboardFiltersState>(defaultState);

export const DashboardFiltersProvider = ({ children }: PropsWithChildren) => {
  const [recordFilters, setRecordFilters] = useState<RecordFilter[]>([]);
  const [recordFilterGroups, setRecordFilterGroups] = useState<RecordFilterGroup[]>([]);
  const [isPresetModified, setIsPresetModified] = useState(false);

  const value = useMemo<DashboardFiltersState>(
    () => ({
      recordFilters,
      recordFilterGroups,
      isPresetModified,
      addFilter: (filter) => {
        setRecordFilters((current) => [...current, filter]);
        setIsPresetModified(true);
      },
      removeFilter: (recordFilterId) => {
        setRecordFilters((current) =>
          current.filter((filter) => filter.id !== recordFilterId),
        );
        setIsPresetModified(true);
      },
      updateFilter: (recordFilterId, updates) => {
        setRecordFilters((current) =>
          current.map((filter) =>
            filter.id === recordFilterId ? { ...filter, ...updates } : filter,
          ),
        );
        setIsPresetModified(true);
      },
      resetFilters: () => {
        setRecordFilters([]);
        setRecordFilterGroups([]);
        setIsPresetModified(false);
      },
      replaceAllFilters: ({
        recordFilters: nextRecordFilters,
        recordFilterGroups: nextRecordFilterGroups,
      }) => {
        setRecordFilters(nextRecordFilters);
        setRecordFilterGroups(nextRecordFilterGroups);
        setIsPresetModified(false);
      },
    }),
    [isPresetModified, recordFilterGroups, recordFilters],
  );

  return (
    <DashboardFiltersContext.Provider value={value}>
      {children}
    </DashboardFiltersContext.Provider>
  );
};

export const useDashboardFilters = () => {
  return useContext(DashboardFiltersContext);
};
