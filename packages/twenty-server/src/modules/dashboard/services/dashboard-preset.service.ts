import { Inject, Injectable, Optional } from '@nestjs/common';

import {
  type CreatePresetDTO,
  type PresetDTO,
  type UpdatePresetDTO,
} from 'src/modules/dashboard/dtos/preset.dto';
import { PresetVisibility } from 'src/modules/dashboard/enums/preset-visibility.enum';

const MAX_PRESETS_PER_DASHBOARD_PER_USER = 50;
export const DASHBOARD_PRESET_REPOSITORY = 'DASHBOARD_PRESET_REPOSITORY';

export class LimitExceededException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LimitExceededException';
  }
}

export class UnauthorizedPresetAccessException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedPresetAccessException';
  }
}

export class DuplicatePresetNameException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicatePresetNameException';
  }
}

export type DashboardPresetRepository = {
  countByDashboardAndUser: (args: {
    dashboardId: string;
    userId: string;
  }) => Promise<number>;
  existsByNameForDashboardAndUser: (args: {
    dashboardId: string;
    userId: string;
    name: string;
  }) => Promise<boolean>;
  create: (args: {
    dashboardId: string;
    userId: string;
    data: CreatePresetDTO;
  }) => Promise<PresetDTO>;
  findByDashboardId: (dashboardId: string) => Promise<PresetDTO[]>;
  findById: (presetId: string) => Promise<PresetDTO | null>;
  update: (args: { presetId: string; data: UpdatePresetDTO }) => Promise<PresetDTO>;
  delete: (presetId: string) => Promise<void>;
};

@Injectable()
export class DashboardPresetService {
  constructor(
    @Optional()
    @Inject(DASHBOARD_PRESET_REPOSITORY)
    private readonly presetRepository?: DashboardPresetRepository,
  ) {}

  async createPreset({
    dashboardId,
    userId,
    preset,
  }: {
    dashboardId: string;
    userId: string;
    preset: CreatePresetDTO;
  }): Promise<PresetDTO> {
    const repository = this.getRepositoryOrThrow();
    const currentPresetCount =
      await repository.countByDashboardAndUser({
        dashboardId,
        userId,
      });

    if (currentPresetCount >= MAX_PRESETS_PER_DASHBOARD_PER_USER) {
      throw new LimitExceededException(
        `Preset limit reached for dashboard "${dashboardId}" and user "${userId}"`,
      );
    }

    const hasDuplicatePresetName =
      await repository.existsByNameForDashboardAndUser({
        dashboardId,
        userId,
        name: preset.name,
      });

    if (hasDuplicatePresetName) {
      throw new DuplicatePresetNameException(
        `Preset name "${preset.name}" already exists for this dashboard and user`,
      );
    }

    return repository.create({
      dashboardId,
      userId,
      data: preset,
    });
  }

  async findPresets({
    dashboardId,
    userId,
    teamIds,
  }: {
    dashboardId: string;
    userId: string;
    teamIds: string[];
  }): Promise<PresetDTO[]> {
    const repository = this.getRepositoryOrThrow();
    const presets = await repository.findByDashboardId(dashboardId);

    return presets.filter((preset) => {
      if (preset.ownerId === userId) {
        return true;
      }

      if (preset.visibility === PresetVisibility.PUBLIC) {
        return true;
      }

      if (preset.visibility !== PresetVisibility.TEAM) {
        return false;
      }

      return (preset.teamIds ?? []).some((teamId) => teamIds.includes(teamId));
    });
  }

  async updatePreset({
    presetId,
    userId,
    data,
  }: {
    presetId: string;
    userId: string;
    data: UpdatePresetDTO;
  }): Promise<PresetDTO> {
    const repository = this.getRepositoryOrThrow();
    const preset = await this.getPresetOrThrow(presetId);

    if (!this.canEditPreset(preset, userId)) {
      throw new UnauthorizedPresetAccessException(
        `User "${userId}" does not have edit rights on preset "${presetId}"`,
      );
    }

    return repository.update({ presetId, data });
  }

  async deletePreset({
    presetId,
    userId,
  }: {
    presetId: string;
    userId: string;
  }): Promise<void> {
    const repository = this.getRepositoryOrThrow();
    const preset = await this.getPresetOrThrow(presetId);

    if (!this.canEditPreset(preset, userId)) {
      throw new UnauthorizedPresetAccessException(
        `User "${userId}" does not have delete rights on preset "${presetId}"`,
      );
    }

    await repository.delete(presetId);
  }

  private async getPresetOrThrow(presetId: string): Promise<PresetDTO> {
    const repository = this.getRepositoryOrThrow();
    const preset = await repository.findById(presetId);

    if (preset === null) {
      throw new UnauthorizedPresetAccessException(
        `Preset "${presetId}" not found`,
      );
    }

    return preset;
  }

  private canEditPreset(preset: PresetDTO, userId: string): boolean {
    if (preset.ownerId === userId) {
      return true;
    }

    return (preset.editorIds ?? []).includes(userId);
  }

  private getRepositoryOrThrow(): DashboardPresetRepository {
    if (!this.presetRepository) {
      throw new Error('Dashboard preset repository is not configured');
    }

    return this.presetRepository;
  }
}
