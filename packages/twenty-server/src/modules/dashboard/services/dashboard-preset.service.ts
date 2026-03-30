import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
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

        return presets.map((preset) => this.toDTO(preset));
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

        return this.toDTO(preset);
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

        return this.toDTO(preset);
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
      'id' | 'name' | 'filterState' | 'lastUsedAt'
    >,
  ): DashboardPresetDTO {
    return {
      id: preset.id,
      name: preset.name,
      filterState: preset.filterState,
      lastUsedAt: preset.lastUsedAt.toISOString(),
    };
  }
}
