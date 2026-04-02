import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react';

import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export type DashboardFilterContextValue = {
  globalFilters: RecordFilter[];
  setGlobalFilters: Dispatch<SetStateAction<RecordFilter[]>>;
};

export const DashboardFilterContext =
  createContext<DashboardFilterContextValue>({
    globalFilters: [],
    setGlobalFilters: () => [],
  });

export const DashboardFilterProvider = ({
  children,
  initialGlobalFilters = [],
}: {
  children: ReactNode;
  initialGlobalFilters?: RecordFilter[];
}) => {
  const [globalFilters, setGlobalFilters] =
    useState<RecordFilter[]>(initialGlobalFilters);

  return (
    <DashboardFilterContext.Provider
      value={{
        globalFilters,
        setGlobalFilters,
      }}
    >
      {children}
    </DashboardFilterContext.Provider>
  );
};
