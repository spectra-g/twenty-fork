import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react';

import { type DashboardPreset } from '@/dashboard/types/DashboardPreset';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

export type DashboardFilterContextValue = {
  globalFilters: RecordFilter[];
  globalFilterGroups: RecordFilterGroup[];
  presets: DashboardPreset[];
  setGlobalFilters: Dispatch<SetStateAction<RecordFilter[]>>;
  setGlobalFilterGroups: Dispatch<SetStateAction<RecordFilterGroup[]>>;
  setPresets: Dispatch<SetStateAction<DashboardPreset[]>>;
};

export const DashboardFilterContext =
  createContext<DashboardFilterContextValue>({
    globalFilters: [],
    globalFilterGroups: [],
    presets: [],
    setGlobalFilters: () => [],
    setGlobalFilterGroups: () => [],
    setPresets: () => [],
  });

export const DashboardFilterProvider = ({
  children,
  initialGlobalFilters = [],
  initialGlobalFilterGroups = [],
  initialPresets = [],
}: {
  children: ReactNode;
  initialGlobalFilters?: RecordFilter[];
  initialGlobalFilterGroups?: RecordFilterGroup[];
  initialPresets?: DashboardPreset[];
}) => {
  const [globalFilters, setGlobalFilters] =
    useState<RecordFilter[]>(initialGlobalFilters);
  const [globalFilterGroups, setGlobalFilterGroups] = useState<
    RecordFilterGroup[]
  >(initialGlobalFilterGroups);
  const [presets, setPresets] = useState<DashboardPreset[]>(initialPresets);

  return (
    <DashboardFilterContext.Provider
      value={{
        globalFilters,
        globalFilterGroups,
        presets,
        setGlobalFilters,
        setGlobalFilterGroups,
        setPresets,
      }}
    >
      {children}
    </DashboardFilterContext.Provider>
  );
};
