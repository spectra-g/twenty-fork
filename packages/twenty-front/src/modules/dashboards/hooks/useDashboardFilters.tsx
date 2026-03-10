import { type PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

type DashboardFiltersState = {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
  selectedPresetId: string | null;
  isPresetModified: boolean;
  activatePreset: (params: {
    presetId: string;
    recordFilters: RecordFilter[];
    recordFilterGroups: RecordFilterGroup[];
  }) => void;
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
  selectedPresetId: null,
  isPresetModified: false,
  activatePreset: noop,
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
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [presetBaseline, setPresetBaseline] = useState<{
    recordFilters: RecordFilter[];
    recordFilterGroups: RecordFilterGroup[];
  } | null>(null);

  const isPresetModified = useMemo(() => {
    if (presetBaseline === null) {
      return false;
    }

    return (
      JSON.stringify(presetBaseline.recordFilters) !==
        JSON.stringify(recordFilters) ||
      JSON.stringify(presetBaseline.recordFilterGroups) !==
        JSON.stringify(recordFilterGroups)
    );
  }, [presetBaseline, recordFilterGroups, recordFilters]);

  const value = useMemo<DashboardFiltersState>(
    () => ({
      recordFilters,
      recordFilterGroups,
      selectedPresetId,
      isPresetModified,
      activatePreset: ({
        presetId,
        recordFilters: presetRecordFilters,
        recordFilterGroups: presetRecordFilterGroups,
      }) => {
        setSelectedPresetId(presetId);
        setPresetBaseline({
          recordFilters: presetRecordFilters,
          recordFilterGroups: presetRecordFilterGroups,
        });
        setRecordFilters(presetRecordFilters);
        setRecordFilterGroups(presetRecordFilterGroups);
      },
      addFilter: (filter) => {
        setRecordFilters((current) => [...current, filter]);
      },
      removeFilter: (recordFilterId) => {
        setRecordFilters((current) =>
          current.filter((filter) => filter.id !== recordFilterId),
        );
      },
      updateFilter: (recordFilterId, updates) => {
        setRecordFilters((current) =>
          current.map((filter) =>
            filter.id === recordFilterId ? { ...filter, ...updates } : filter,
          ),
        );
      },
      resetFilters: () => {
        setRecordFilters([]);
        setRecordFilterGroups([]);
        setSelectedPresetId(null);
        setPresetBaseline(null);
      },
      replaceAllFilters: ({
        recordFilters: nextRecordFilters,
        recordFilterGroups: nextRecordFilterGroups,
      }) => {
        setRecordFilters(nextRecordFilters);
        setRecordFilterGroups(nextRecordFilterGroups);
        setSelectedPresetId(null);
        setPresetBaseline(null);
      },
    }),
    [isPresetModified, recordFilterGroups, recordFilters, selectedPresetId],
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
