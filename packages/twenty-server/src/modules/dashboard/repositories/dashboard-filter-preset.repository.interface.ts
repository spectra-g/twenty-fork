export type DashboardFilterPresetFilters = {
  recordFilters?: unknown[];
  recordFilterGroups?: unknown[];
};

export type DashboardFilterPreset = {
  id: string;
  dashboardId: string;
  name: string;
  filters: DashboardFilterPresetFilters;
};

export type CreateDashboardFilterPresetInput = {
  dashboardId: string;
  name: string;
  filters: DashboardFilterPresetFilters;
};

export interface DashboardFilterPresetRepository {
  findByDashboardId(dashboardId: string): Promise<DashboardFilterPreset[]>;
  save(
    input: CreateDashboardFilterPresetInput,
  ): Promise<DashboardFilterPreset>;
}
