import { createContext, useContext } from 'react';

export type DashboardFilterVariable = {
  fieldMetadataId: string;
  operand: string;
  value: string;
};

export const DashboardFiltersContext = createContext<DashboardFilterVariable[]>(
  [],
);

export const useDashboardFilterVariables = () =>
  useContext(DashboardFiltersContext);
