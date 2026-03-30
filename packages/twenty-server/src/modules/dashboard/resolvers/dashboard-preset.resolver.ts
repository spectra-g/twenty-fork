import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  DeleteDashboardPresetResponseDTO,
  DashboardFiltersAndPresetsDTO,
  SaveDashboardPresetResponseDTO,
} from 'src/modules/dashboard/dtos/dashboard-preset-response.dto';
import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class DashboardPresetResolver {
  constructor(
    private readonly dashboardPresetService: DashboardPresetService,
  ) {}

  @Query(() => DashboardFiltersAndPresetsDTO)
  @UseGuards(NoPermissionGuard)
  async dashboardFiltersAndPresets(
    @Args('dashboardId', { type: () => UUIDScalarType }) dashboardId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<DashboardFiltersAndPresetsDTO> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    const [activeFilterState, presets] = await Promise.all([
      this.dashboardPresetService.getActiveFilterState(
        dashboardId,
        authContext,
      ),
      this.dashboardPresetService.getPresetsForDashboard(
        dashboardId,
        authContext,
      ),
    ]);

    return {
      activeFilterState,
      presets,
    };
  }

  @Mutation(() => SaveDashboardPresetResponseDTO)
  @UseGuards(NoPermissionGuard)
  async saveDashboardPreset(
    @Args('dashboardId', { type: () => UUIDScalarType }) dashboardId: string,
    @Args('name', { type: () => String }) name: string,
    @Args('filterState', { type: () => GraphQLJSON, nullable: true })
    filterState: Record<string, unknown> | null,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<SaveDashboardPresetResponseDTO> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    const preset = await this.dashboardPresetService.savePreset(
      dashboardId,
      name,
      filterState,
      authContext,
    );

    return {
      success: true,
      preset,
    };
  }

  @Mutation(() => SaveDashboardPresetResponseDTO)
  @UseGuards(NoPermissionGuard)
  async touchDashboardPreset(
    @Args('presetId', { type: () => UUIDScalarType }) presetId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<SaveDashboardPresetResponseDTO> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    const preset = await this.dashboardPresetService.touchPreset(
      presetId,
      authContext,
    );

    return {
      success: true,
      preset,
    };
  }

  @Mutation(() => SaveDashboardPresetResponseDTO)
  @UseGuards(NoPermissionGuard)
  async renameDashboardPreset(
    @Args('presetId', { type: () => UUIDScalarType }) presetId: string,
    @Args('name', { type: () => String }) name: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<SaveDashboardPresetResponseDTO> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    const preset = await this.dashboardPresetService.renamePreset(
      presetId,
      name,
      authContext,
    );

    return {
      success: true,
      preset,
    };
  }

  @Mutation(() => DeleteDashboardPresetResponseDTO)
  @UseGuards(NoPermissionGuard)
  async deleteDashboardPreset(
    @Args('presetId', { type: () => UUIDScalarType }) presetId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<DeleteDashboardPresetResponseDTO> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    await this.dashboardPresetService.deletePreset(presetId, authContext);

    return {
      success: true,
    };
  }
}
