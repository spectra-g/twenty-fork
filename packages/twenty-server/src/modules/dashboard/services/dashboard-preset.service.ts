import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import {
  ConflictError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { DashboardPresetEntity } from 'src/engine/metadata-modules/dashboard-preset/entities/dashboard-preset.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { DashboardPresetDTO } from 'src/modules/dashboard/dtos/dashboard-preset.dto';
import { CreateDashboardPresetInput } from 'src/modules/dashboard/dtos/create-dashboard-preset.input';
import { UpdateDashboardPresetInput } from 'src/modules/dashboard/dtos/update-dashboard-preset.input';
import {
  DashboardException,
  DashboardExceptionCode,
  DashboardExceptionMessageKey,
  generateDashboardExceptionMessage,
} from 'src/modules/dashboard/exceptions/dashboard.exception';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

const cloneFilter = (filter: DashboardPresetDTO['filter']) =>
  JSON.parse(JSON.stringify(filter)) as DashboardPresetDTO['filter'];

const clonePreset = (preset: DashboardPresetDTO): DashboardPresetDTO => ({
  ...preset,
  filter: cloneFilter(preset.filter),
});

const toDashboardPresetDTO = (
  dashboardPreset: DashboardPresetEntity,
): DashboardPresetDTO => ({
  id: dashboardPreset.id,
  dashboardId: dashboardPreset.dashboardId,
  name: dashboardPreset.name,
  filter: cloneFilter(dashboardPreset.filter),
  createdAt: dashboardPreset.createdAt.toISOString(),
  updatedAt: dashboardPreset.updatedAt.toISOString(),
});

@Injectable()
export class DashboardPresetService {
  constructor(
    @InjectRepository(DashboardPresetEntity)
    private readonly dashboardPresetRepository: Repository<DashboardPresetEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async createPreset(
    input: CreateDashboardPresetInput & { workspaceId: string },
  ): Promise<DashboardPresetDTO> {
    await this.assertDashboardExists({
      workspaceId: input.workspaceId,
      dashboardId: input.dashboardId,
    });

    await this.assertNameIsUnique({
      dashboardId: input.dashboardId,
      name: input.name,
    });

    const preset = this.dashboardPresetRepository.create({
      name: input.name,
      dashboardId: input.dashboardId,
      filter: cloneFilter(input.filter),
    });
    const createdPreset = await this.dashboardPresetRepository.save(preset);

    return clonePreset(toDashboardPresetDTO(createdPreset));
  }

  async findAllPresetsByDashboardId({
    workspaceId,
    dashboardId,
  }: {
    workspaceId: string;
    dashboardId: string;
  }): Promise<DashboardPresetDTO[]> {
    await this.assertDashboardExists({ workspaceId, dashboardId });

    const presets = await this.dashboardPresetRepository.find({
      where: {
        dashboardId,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return presets.map((preset) => clonePreset(toDashboardPresetDTO(preset)));
  }

  async findPresetById(id: string): Promise<DashboardPresetDTO> {
    const preset = await this.dashboardPresetRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (preset === null) {
      throw new NotFoundError(`Dashboard preset ${id} not found`);
    }

    return clonePreset(toDashboardPresetDTO(preset));
  }

  async updatePreset(
    input: UpdateDashboardPresetInput,
  ): Promise<DashboardPresetDTO> {
    const existingPreset = await this.dashboardPresetRepository.findOne({
      where: {
        id: input.id,
        deletedAt: IsNull(),
      },
    });

    if (existingPreset === null) {
      throw new NotFoundError(`Dashboard preset ${input.id} not found`);
    }

    const nextName = input.name ?? existingPreset.name;

    if (nextName !== existingPreset.name) {
      await this.assertNameIsUnique({
        dashboardId: existingPreset.dashboardId,
        name: nextName,
        excludedPresetId: existingPreset.id,
      });
    }

    const updatedPreset = await this.dashboardPresetRepository.save({
      ...existingPreset,
      name: nextName,
      filter:
        input.filter === undefined
          ? cloneFilter(existingPreset.filter)
          : cloneFilter(input.filter),
    });

    return clonePreset(toDashboardPresetDTO(updatedPreset));
  }

  async deletePreset(id: string): Promise<boolean> {
    const deleteResult = await this.dashboardPresetRepository.softDelete(id);

    return (deleteResult.affected ?? 0) > 0;
  }

  private async assertNameIsUnique({
    dashboardId,
    name,
    excludedPresetId,
  }: {
    dashboardId: string;
    name: string;
    excludedPresetId?: string;
  }) {
    const existingPreset = await this.dashboardPresetRepository.findOne({
      where: {
        dashboardId,
        name,
        deletedAt: IsNull(),
      },
    });

    if (existingPreset !== null && existingPreset.id !== excludedPresetId) {
      throw new ConflictError(
        `Dashboard preset "${name}" already exists for dashboard ${dashboardId}`,
      );
    }
  }

  private async assertDashboardExists({
    workspaceId,
    dashboardId,
  }: {
    workspaceId: string;
    dashboardId: string;
  }) {
    const dashboardRepository =
      await this.globalWorkspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
        workspaceId,
        DashboardWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const dashboard = await dashboardRepository.findOne({
      where: { id: dashboardId },
    });

    if (dashboard == null) {
      throw new DashboardException(
        generateDashboardExceptionMessage(
          DashboardExceptionMessageKey.DASHBOARD_NOT_FOUND,
          dashboardId,
        ),
        DashboardExceptionCode.DASHBOARD_NOT_FOUND,
      );
    }
  }
}
