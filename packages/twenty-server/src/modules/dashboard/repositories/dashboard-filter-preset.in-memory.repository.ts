import {
  type CreateDashboardFilterPresetInput,
  type DashboardFilterPreset,
  type DashboardFilterPresetRepository,
} from 'src/modules/dashboard/repositories/dashboard-filter-preset.repository.interface';

export class DashboardFilterPresetInMemoryRepository
  implements DashboardFilterPresetRepository
{
  private readonly presets: DashboardFilterPreset[] = [];

  async findByDashboardId(dashboardId: string): Promise<DashboardFilterPreset[]> {
    if (!dashboardId) {
      return [];
    }

    return this.presets
      .filter((preset) => preset.dashboardId === dashboardId)
      .map((preset) => this.clonePreset(preset));
  }

  async save(input: CreateDashboardFilterPresetInput): Promise<DashboardFilterPreset> {
    const preset: DashboardFilterPreset = {
      id: crypto.randomUUID(),
      dashboardId: input.dashboardId,
      name: input.name,
      filters: {
        recordFilters: [...(input.filters.recordFilters ?? [])],
        recordFilterGroups: [...(input.filters.recordFilterGroups ?? [])],
      },
    };

    this.presets.push(preset);

    return this.clonePreset(preset);
  }

  private clonePreset(preset: DashboardFilterPreset): DashboardFilterPreset {
    return {
      ...preset,
      filters: {
        recordFilters: [...(preset.filters.recordFilters ?? [])],
        recordFilterGroups: [...(preset.filters.recordFilterGroups ?? [])],
      },
    };
  }
}
