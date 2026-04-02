import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { ApplyDashboardPresetInput } from 'src/modules/dashboard/dtos/apply-dashboard-preset.input';
import { ApplyDashboardPresetResultDTO } from 'src/modules/dashboard/dtos/apply-dashboard-preset-result.dto';
import { CreateDashboardPresetInput } from 'src/modules/dashboard/dtos/create-dashboard-preset.input';
import { DashboardPresetDTO } from 'src/modules/dashboard/dtos/dashboard-preset.dto';
import { DashboardPresetEntity } from 'src/modules/dashboard/entities/dashboard-preset.entity';
import {
  DashboardException,
  DashboardExceptionCode,
  DashboardExceptionMessageKey,
  generateDashboardExceptionMessage,
} from 'src/modules/dashboard/exceptions/dashboard.exception';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

@Injectable()
export class DashboardPresetService {
  constructor(
    @InjectRepository(DashboardPresetEntity)
    private readonly dashboardPresetRepository: Repository<DashboardPresetEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly actorFromAuthContextService: ActorFromAuthContextService,
  ) {}

  async create({
    createDashboardPresetInput,
    authContext,
  }: {
    createDashboardPresetInput: CreateDashboardPresetInput;
    authContext: AuthContext;
  }): Promise<DashboardPresetDTO> {
    const workspaceId = this.getWorkspaceIdOrThrow(authContext);

    await this.getDashboardOrThrow({
      dashboardId: createDashboardPresetInput.dashboardId,
      authContext,
    });

    const dashboardPreset = this.dashboardPresetRepository.create({
      dashboardId: createDashboardPresetInput.dashboardId,
      workspaceId,
      name: createDashboardPresetInput.name.trim(),
      filterState: createDashboardPresetInput.filterState,
    });

    return this.toDTO(
      await this.dashboardPresetRepository.save(dashboardPreset),
    );
  }

  async list({
    dashboardId,
    workspaceId,
  }: {
    dashboardId: string;
    workspaceId: string;
  }): Promise<DashboardPresetDTO[]> {
    const dashboardPresets = await this.dashboardPresetRepository.find({
      where: {
        dashboardId,
        workspaceId,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    return dashboardPresets.map((dashboardPreset) =>
      this.toDTO(dashboardPreset),
    );
  }

  async apply({
    applyDashboardPresetInput,
    authContext,
  }: {
    applyDashboardPresetInput: ApplyDashboardPresetInput;
    authContext: AuthContext;
  }): Promise<ApplyDashboardPresetResultDTO> {
    const workspaceId = this.getWorkspaceIdOrThrow(authContext);
    const dashboardPreset = await this.dashboardPresetRepository.findOne({
      where: {
        id: applyDashboardPresetInput.presetId,
        workspaceId,
      },
    });

    if (
      !isDefined(dashboardPreset) ||
      dashboardPreset.dashboardId !==
        applyDashboardPresetInput.targetDashboardId
    ) {
      throw new DashboardException(
        generateDashboardExceptionMessage(
          DashboardExceptionMessageKey.DASHBOARD_PRESET_NOT_FOUND,
          applyDashboardPresetInput.presetId,
        ),
        DashboardExceptionCode.DASHBOARD_PRESET_NOT_FOUND,
      );
    }

    const dashboard = await this.getDashboardOrThrow({
      dashboardId: applyDashboardPresetInput.targetDashboardId,
      authContext,
    });

    const [updatedDashboard] =
      await this.actorFromAuthContextService.injectUpdatedBy({
        records: [
          {
            ...dashboard,
            filterConfiguration: dashboardPreset.filterState,
          },
        ],
        objectMetadataNameSingular: 'dashboard',
        authContext,
      });

    const dashboardRepository = await this.getDashboardRepository(authContext);

    await dashboardRepository.save(
      updatedDashboard as DashboardWorkspaceEntity,
    );

    return {
      dashboardId: dashboard.id,
      filterConfiguration: dashboardPreset.filterState,
    };
  }

  private getWorkspaceIdOrThrow(authContext: AuthContext): string {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    return workspace.id;
  }

  private async getDashboardRepository(
    authContext: AuthContext,
  ): Promise<WorkspaceRepository<DashboardWorkspaceEntity>> {
    const workspaceId = this.getWorkspaceIdOrThrow(authContext);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () =>
        this.globalWorkspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
          workspaceId,
          'dashboard',
          { shouldBypassPermissionChecks: true },
        ),
      authContext as WorkspaceAuthContext,
    );
  }

  private async getDashboardOrThrow({
    dashboardId,
    authContext,
  }: {
    dashboardId: string;
    authContext: AuthContext;
  }): Promise<DashboardWorkspaceEntity> {
    const dashboardRepository = await this.getDashboardRepository(authContext);
    const dashboard = await dashboardRepository.findOne({
      where: {
        id: dashboardId,
      },
    });

    if (!isDefined(dashboard)) {
      throw new DashboardException(
        generateDashboardExceptionMessage(
          DashboardExceptionMessageKey.DASHBOARD_NOT_FOUND,
          dashboardId,
        ),
        DashboardExceptionCode.DASHBOARD_NOT_FOUND,
      );
    }

    return dashboard;
  }

  private toDTO(dashboardPreset: DashboardPresetEntity): DashboardPresetDTO {
    return {
      id: dashboardPreset.id,
      dashboardId: dashboardPreset.dashboardId,
      name: dashboardPreset.name,
      filterState: dashboardPreset.filterState,
      createdAt: dashboardPreset.createdAt,
      updatedAt: dashboardPreset.updatedAt,
    };
  }
}
