import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  DeleteDashboardPresetResponseDTO,
  DashboardFiltersAndPresetsDTO,
  SaveDashboardPresetResponseDTO,
} from 'src/modules/dashboard/dtos/dashboard-preset-response.dto';
import { CreateDashboardPresetBody } from 'src/modules/dashboard/dtos/save-dashboard-preset.input';
import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';

@Controller('rest/dashboards')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class DashboardPresetController {
  constructor(
    private readonly dashboardPresetService: DashboardPresetService,
  ) {}

  @Get(':dashboardId/presets')
  async findAll(
    @Param('dashboardId') dashboardId: string,
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

  @Post(':dashboardId/presets')
  async create(
    @Param('dashboardId') dashboardId: string,
    @Body() body: CreateDashboardPresetBody,
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
      body.name,
      body.filterState,
      authContext,
    );

    return {
      success: true,
      preset,
    };
  }

  @Post('presets/:presetId/touch')
  async touch(
    @Param('presetId') presetId: string,
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

  @Patch('presets/:presetId')
  async rename(
    @Param('presetId') presetId: string,
    @Body() body: { name: string },
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
      body.name,
      authContext,
    );

    return {
      success: true,
      preset,
    };
  }

  @Delete('presets/:presetId')
  async delete(
    @Param('presetId') presetId: string,
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
