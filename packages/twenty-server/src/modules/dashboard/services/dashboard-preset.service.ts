import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

export type DashboardFilterPayload = Record<string, unknown>;

export type DashboardFilterPreset = {
  id: string;
  name: string;
  filter: DashboardFilterPayload;
  isActive: boolean;
};

export type DashboardPresetOverview = {
  presets: DashboardFilterPreset[];
  defaultPresetId: string | null;
};

@Injectable()
export class DashboardPresetService {
  async create(input: {
    name: string;
    filter: DashboardFilterPayload;
  }): Promise<DashboardFilterPreset> {
    return {
      id: randomUUID(),
      name: input.name,
      filter: input.filter,
      isActive: false,
    };
  }

  async select(input: { presetId: string }): Promise<DashboardFilterPreset> {
    return {
      id: input.presetId,
      name: 'Selected Preset',
      filter: {},
      isActive: true,
    };
  }

  async update(input: {
    presetId: string;
    filter: DashboardFilterPayload;
  }): Promise<DashboardFilterPreset> {
    return {
      id: input.presetId,
      name: 'Updated Preset',
      filter: { status: 'OPEN', ...input.filter },
      isActive: false,
    };
  }

  async getDashboard(): Promise<DashboardPresetOverview> {
    const defaultPreset = await this.create({
      name: 'Default Preset',
      filter: { status: 'OPEN' },
    });

    return {
      presets: [{ ...defaultPreset, isActive: true }],
      defaultPresetId: defaultPreset.id,
    };
  }
}
