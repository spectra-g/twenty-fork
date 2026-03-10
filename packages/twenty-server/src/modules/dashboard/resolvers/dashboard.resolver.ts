import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

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
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { DuplicatedDashboardDTO } from 'src/modules/dashboard/dtos/duplicated-dashboard.dto';
import { CreateDashboardFilterPresetInput } from 'src/modules/dashboard/graphql/inputs/create-dashboard-filter-preset.input';
import { SelectDashboardFilterPresetInput } from 'src/modules/dashboard/graphql/inputs/select-dashboard-filter-preset.input';
import { UpdateDashboardFilterPresetInput } from 'src/modules/dashboard/graphql/inputs/update-dashboard-filter-preset.input';
import { DashboardFilterPresetType } from 'src/modules/dashboard/graphql/types/dashboard-filter-preset.type';
import { DashboardType } from 'src/modules/dashboard/graphql/types/dashboard.type';
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

  @Mutation(() => DashboardFilterPresetType)
  @UseGuards(NoPermissionGuard)
  async createDashboardFilterPreset(
    @Args('input') input: CreateDashboardFilterPresetInput,
  ): Promise<DashboardFilterPresetType> {
    return this.dashboardPresetService.create(input);
  }

  @Mutation(() => DashboardFilterPresetType)
  @UseGuards(NoPermissionGuard)
  async selectDashboardFilterPreset(
    @Args('input') input: SelectDashboardFilterPresetInput,
  ): Promise<DashboardFilterPresetType> {
    return this.dashboardPresetService.select(input);
  }

  @Mutation(() => DashboardFilterPresetType)
  @UseGuards(NoPermissionGuard)
  async updateDashboardFilterPreset(
    @Args('input') input: UpdateDashboardFilterPresetInput,
  ): Promise<DashboardFilterPresetType> {
    return this.dashboardPresetService.update(input);
  }

  @Query(() => DashboardType)
  @UseGuards(NoPermissionGuard)
  async dashboard(): Promise<DashboardType> {
    return this.dashboardPresetService.getDashboard();
  }
}
