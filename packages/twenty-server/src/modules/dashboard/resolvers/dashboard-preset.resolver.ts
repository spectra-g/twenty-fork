import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

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
import { ApplyDashboardPresetInput } from 'src/modules/dashboard/dtos/apply-dashboard-preset.input';
import { ApplyDashboardPresetResultDTO } from 'src/modules/dashboard/dtos/apply-dashboard-preset-result.dto';
import { CreateDashboardPresetInput } from 'src/modules/dashboard/dtos/create-dashboard-preset.input';
import { DashboardPresetDTO } from 'src/modules/dashboard/dtos/dashboard-preset.dto';
import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';
import { DashboardGraphqlApiExceptionFilter } from 'src/modules/dashboard/utils/dashboard-graphql-api-exception.filter';

@MetadataResolver()
@UseFilters(DashboardGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class DashboardPresetResolver {
  constructor(
    private readonly dashboardPresetService: DashboardPresetService,
  ) {}

  @Mutation(() => DashboardPresetDTO)
  @UseGuards(NoPermissionGuard)
  async createDashboardPreset(
    @Args('input') createDashboardPresetInput: CreateDashboardPresetInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<DashboardPresetDTO> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    return this.dashboardPresetService.create({
      createDashboardPresetInput,
      authContext,
    });
  }

  @Query(() => [DashboardPresetDTO])
  @UseGuards(NoPermissionGuard)
  async listDashboardPresets(
    @Args('dashboardId', { type: () => String }) dashboardId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<DashboardPresetDTO[]> {
    return this.dashboardPresetService.list({
      dashboardId,
      workspaceId,
    });
  }

  @Mutation(() => ApplyDashboardPresetResultDTO)
  @UseGuards(NoPermissionGuard)
  async applyDashboardPreset(
    @Args('input') applyDashboardPresetInput: ApplyDashboardPresetInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ApplyDashboardPresetResultDTO> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    return this.dashboardPresetService.apply({
      applyDashboardPresetInput,
      authContext,
    });
  }
}
