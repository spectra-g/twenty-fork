import { Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { DashboardPresetDTO } from 'src/modules/dashboard/dtos/dashboard-preset.dto';
import { CreateDashboardPresetInput } from 'src/modules/dashboard/dtos/create-dashboard-preset.input';
import { UpdateDashboardPresetInput } from 'src/modules/dashboard/dtos/update-dashboard-preset.input';

const cloneFilter = (filter: DashboardPresetDTO['filter']) =>
  JSON.parse(JSON.stringify(filter)) as DashboardPresetDTO['filter'];

const clonePreset = (preset: DashboardPresetDTO): DashboardPresetDTO => ({
  ...preset,
  filter: cloneFilter(preset.filter),
});

@Injectable()
export class DashboardPresetService {
  private readonly presetsByDashboardId = new Map<
    string,
    DashboardPresetDTO[]
  >();

  // @clawdence-stub: STORY-125 - Implement actual createPreset method with database persistence and proper error handling
  async createPreset(
    input: CreateDashboardPresetInput,
  ): Promise<DashboardPresetDTO> {
    const timestamp = new Date().toISOString();
    const preset: DashboardPresetDTO = {
      id: uuidv4(),
      name: input.name,
      dashboardId: input.dashboardId,
      filter: cloneFilter(input.filter),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const currentPresets =
      this.presetsByDashboardId.get(input.dashboardId) ?? [];

    this.presetsByDashboardId.set(input.dashboardId, [
      ...currentPresets,
      preset,
    ]);

    return clonePreset(preset);
  }

  // @clawdence-stub: STORY-125 - Implement actual findAllPresetsByDashboardId with database query
  async findAllPresetsByDashboardId(
    dashboardId: string,
  ): Promise<DashboardPresetDTO[]> {
    return (this.presetsByDashboardId.get(dashboardId) ?? []).map(clonePreset);
  }

  // @clawdence-stub: STORY-125 - Implement actual updatePreset with database update and validation
  async updatePreset(
    input: UpdateDashboardPresetInput,
  ): Promise<DashboardPresetDTO> {
    for (const [dashboardId, presets] of this.presetsByDashboardId.entries()) {
      const presetIndex = presets.findIndex((preset) => preset.id === input.id);

      if (presetIndex === -1) {
        continue;
      }

      const currentPreset = presets[presetIndex];
      const updatedPreset: DashboardPresetDTO = {
        ...currentPreset,
        name: input.name ?? currentPreset.name,
        filter:
          input.filter === undefined
            ? cloneFilter(currentPreset.filter)
            : cloneFilter(input.filter),
        updatedAt: new Date().toISOString(),
      };

      this.presetsByDashboardId.set(dashboardId, [
        ...presets.slice(0, presetIndex),
        updatedPreset,
        ...presets.slice(presetIndex + 1),
      ]);

      return clonePreset(updatedPreset);
    }

    throw new Error(`Dashboard preset ${input.id} not found`);
  }

  // @clawdence-stub: STORY-125 - Implement actual deletePreset with database deletion and cascade checks
  async deletePreset(id: string): Promise<boolean> {
    for (const [dashboardId, presets] of this.presetsByDashboardId.entries()) {
      const nextPresets = presets.filter((preset) => preset.id !== id);

      if (nextPresets.length === presets.length) {
        continue;
      }

      this.presetsByDashboardId.set(dashboardId, nextPresets);

      return true;
    }

    return false;
  }
}
