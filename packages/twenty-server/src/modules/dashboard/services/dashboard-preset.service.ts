import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { DashboardPresetDTO } from 'src/modules/dashboard/dtos/dashboard-preset.dto';
import { type DashboardPresetWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard-preset.workspace-entity';

@Injectable()
export class DashboardPresetService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async getPresetsForDashboard(
    dashboardId: string,
    authContext: AuthContext,
  ): Promise<DashboardPresetDTO[]> {
    const repository = await this.getRepository(authContext);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const presets = await repository.find({
          where: { dashboardId },
          order: { lastUsedAt: 'DESC' },
        });

        return presets.map((preset) => this.toDTO(preset, authContext));
      },
      authContext as never,
    );
  }

  async getActiveFilterState(
    dashboardId: string,
    authContext: AuthContext,
  ): Promise<Record<string, unknown> | null> {
    void dashboardId;
    void authContext;

    return null;
  }

  validateFilterState(filterState: Record<string, unknown> | null): {
    isValid: boolean;
  } {
    if (
      filterState === null ||
      Array.isArray(filterState) ||
      Object.keys(filterState).length === 0
    ) {
      throw new UserInputError('Filter state is required');
    }

    return { isValid: true };
  }

  async savePreset(
    dashboardId: string,
    name: string,
    filterState: Record<string, unknown> | null,
    authContext: AuthContext,
  ): Promise<DashboardPresetDTO> {
    this.validateFilterState(filterState);

    const repository = await this.getRepository(authContext);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const lastUsedAt = new Date();
        const insertResult = await repository.insert({
          dashboardId,
          name,
          createdByUserWorkspaceId: authContext.userWorkspaceId ?? null,
          filterState,
          lastUsedAt,
        });
        const presetId = insertResult.identifiers[0]?.id;

        const preset = isDefined(presetId)
          ? await repository.findOne({ where: { id: presetId } })
          : null;

        if (!isDefined(preset)) {
          throw new Error('Failed to read saved dashboard preset');
        }

        return this.toDTO(preset, authContext);
      },
      authContext as never,
    );
  }

  async touchPreset(
    presetId: string,
    authContext: AuthContext,
  ): Promise<DashboardPresetDTO> {
    const repository = await this.getRepository(authContext);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await repository.update(presetId, {
          lastUsedAt: new Date(),
        });

        const preset = await repository.findOne({
          where: { id: presetId },
        });

        if (!isDefined(preset)) {
          throw new Error(`Dashboard preset "${presetId}" not found`);
        }

        return this.toDTO(preset, authContext);
      },
      authContext as never,
    );
  }

  async renamePreset(
    presetId: string,
    name: string,
    authContext: AuthContext,
  ): Promise<DashboardPresetDTO> {
    const repository = await this.getRepository(authContext);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const preset = await repository.findOne({
          where: { id: presetId },
        });

        this.assertPresetIsEditable(preset, authContext);

        await repository.update(presetId, {
          name,
        });

        const updatedPreset = await repository.findOne({
          where: { id: presetId },
        });

        if (!isDefined(updatedPreset)) {
          throw new Error(`Dashboard preset "${presetId}" not found`);
        }

        return this.toDTO(updatedPreset, authContext);
      },
      authContext as never,
    );
  }

  async deletePreset(
    presetId: string,
    authContext: AuthContext,
  ): Promise<void> {
    const repository = await this.getRepository(authContext);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const preset = await repository.findOne({
          where: { id: presetId },
        });

        this.assertPresetIsEditable(preset, authContext);

        await repository.delete(presetId);
      },
      authContext as never,
    );
  }

  private async getRepository(authContext: AuthContext) {
    const { workspace } = authContext;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    return this.globalWorkspaceOrmManager.getRepository<DashboardPresetWorkspaceEntity>(
      workspace.id,
      'dashboardPreset',
      { shouldBypassPermissionChecks: true },
    );
  }

  private toDTO(
    preset: Pick<
      DashboardPresetWorkspaceEntity,
      'id' | 'name' | 'createdByUserWorkspaceId' | 'filterState' | 'lastUsedAt'
    >,
    authContext: Pick<AuthContext, 'userWorkspaceId'>,
  ): DashboardPresetDTO {
    return {
      id: preset.id,
      name: preset.name,
      filterState: preset.filterState,
      canEdit:
        isDefined(authContext.userWorkspaceId) &&
        preset.createdByUserWorkspaceId === authContext.userWorkspaceId,
      lastUsedAt: preset.lastUsedAt.toISOString(),
    };
  }

  private assertPresetIsEditable(
    preset: Pick<
      DashboardPresetWorkspaceEntity,
      'id' | 'createdByUserWorkspaceId'
    > | null,
    authContext: AuthContext,
  ) {
    if (!isDefined(preset)) {
      throw new Error('Dashboard preset not found');
    }

    if (preset.createdByUserWorkspaceId !== authContext.userWorkspaceId) {
      throw new ForbiddenError(
        'You do not have permission to edit this dashboard preset',
      );
    }
  }
}
