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
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { DashboardFiltersOutput } from 'src/modules/dashboard/dtos/dashboard-filters.output';
import { DuplicatedDashboardDTO } from 'src/modules/dashboard/dtos/duplicated-dashboard.dto';
import { UpdateDashboardFiltersInput } from 'src/modules/dashboard/dtos/update-dashboard-filters.input';
import { UpdateDashboardFiltersOutput } from 'src/modules/dashboard/dtos/update-dashboard-filters.output';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';
import { DashboardFilterService } from 'src/modules/dashboard/services/dashboard-filter.service';
import { DashboardGraphqlApiExceptionFilter } from 'src/modules/dashboard/utils/dashboard-graphql-api-exception.filter';

@MetadataResolver()
@UseFilters(
  DashboardGraphqlApiExceptionFilter,
  PageLayoutGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
)
@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
export class DashboardResolver {
  constructor(
    private readonly dashboardDuplicationService: DashboardDuplicationService,
    private readonly dashboardFilterService: DashboardFilterService,
  ) {}

  @Query(() => DashboardFiltersOutput)
  @UseGuards(NoPermissionGuard)
  async getDashboardFilters(
    @Args('dashboardId', { type: () => UUIDScalarType }) dashboardId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<DashboardFiltersOutput> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    return this.dashboardFilterService.getDashboardFilters({
      dashboardId,
      authContext,
    });
  }

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

  @Mutation(() => UpdateDashboardFiltersOutput)
  @UseGuards(NoPermissionGuard)
  async updateDashboardFilters(
    @Args('input') input: UpdateDashboardFiltersInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<UpdateDashboardFiltersOutput> {
    const authContext: AuthContext = {
      user,
      workspace,
      workspaceMemberId,
      userWorkspaceId,
    };

    return this.dashboardFilterService.updateDashboardFilters({
      input,
      authContext,
    });
  }
}
