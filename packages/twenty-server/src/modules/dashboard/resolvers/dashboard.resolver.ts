/* eslint-disable @nx/enforce-module-boundaries */
import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { CreateDashboardPresetInput } from 'src/modules/dashboard/dtos/create-dashboard-preset.input';
import { DashboardPresetDTO } from 'src/modules/dashboard/dtos/dashboard-preset.dto';
import { DuplicatedDashboardDTO } from 'src/modules/dashboard/dtos/duplicated-dashboard.dto';
import { UpdateDashboardPresetInput } from 'src/modules/dashboard/dtos/update-dashboard-preset.input';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';
import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';
import { DashboardGraphqlApiExceptionFilter } from 'src/modules/dashboard/utils/dashboard-graphql-api-exception.filter';

@MetadataResolver()
@UseFilters(
  DashboardGraphqlApiExceptionFilter,
  PageLayoutGraphqlApiExceptionFilter,
)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class DashboardResolver {
  constructor(
    private readonly dashboardDuplicationService: DashboardDuplicationService,
    private readonly dashboardPresetService: DashboardPresetService,
  ) {}

  @Mutation(() => DuplicatedDashboardDTO)
  @UseGuards(NoPermissionGuard)
  async duplicateDashboard(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<DuplicatedDashboardDTO> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    return this.dashboardDuplicationService.duplicateDashboard(id, authContext);
  }

  @Query(() => [DashboardPresetDTO])
  @UseGuards(NoPermissionGuard)
  // @clawdence-stub: STORY-127 - Support URL query param for preset resolution in list query
  async dashboardPresets(
    @Args('dashboardId', { type: () => UUIDScalarType }) dashboardId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<DashboardPresetDTO[]> {
    return this.dashboardPresetService.findAllPresetsByDashboardId({
      workspaceId: workspace.id,
      dashboardId,
    });
  }

  @Query(() => DashboardPresetDTO)
  @UseGuards(NoPermissionGuard)
  // @clawdence-stub: STORY-127 - URL hydration logic will be added here to handle query-param filter state
  async dashboardPreset(
    @Args('id', { type: () => UUIDScalarType }) id: string,
  ): Promise<DashboardPresetDTO> {
    return this.dashboardPresetService.findPresetById(id);
  }

  @Mutation(() => DashboardPresetDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async createDashboardPreset(
    @Args('input') input: CreateDashboardPresetInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<DashboardPresetDTO> {
    return this.dashboardPresetService.createPreset({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => DashboardPresetDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async updateDashboardPreset(
    @Args('input') input: UpdateDashboardPresetInput,
  ): Promise<DashboardPresetDTO> {
    return this.dashboardPresetService.updatePreset(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async deleteDashboardPreset(
    @Args('id', { type: () => UUIDScalarType }) id: string,
  ): Promise<boolean> {
    return this.dashboardPresetService.deletePreset(id);
  }
}
