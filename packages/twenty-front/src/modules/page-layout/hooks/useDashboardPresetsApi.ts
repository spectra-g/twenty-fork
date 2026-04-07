/* eslint-disable @nx/enforce-module-boundaries */
import { type ChartFilter } from 'twenty-shared/types';

export type DashboardPreset = {
  id: string;
  name: string;
  filterState: ChartFilter;
  createdAt: string;
};

// @clawdence-stub: STORY-124 - Implement real GraphQL mutations for preset CRUD operations
const createDashboardPreset = async (
  name: string,
  filterState: ChartFilter,
): Promise<DashboardPreset> => {
  return {
    id: 'mock-preset-1',
    name,
    filterState,
    createdAt: new Date().toISOString(),
  };
};

const renameDashboardPreset = async (id: string, name: string) => {
  return { id, name };
};

const deleteDashboardPreset = async (_id: string) => {
  return true;
};

const listDashboardPresets = async (_dashboardId: string) => {
  return [] as DashboardPreset[];
};

export const useDashboardPresetsApi = () => {
  return {
    createDashboardPreset,
    renameDashboardPreset,
    deleteDashboardPreset,
    listDashboardPresets,
  };
};
