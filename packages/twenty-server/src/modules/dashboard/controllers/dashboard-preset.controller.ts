import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  CreateDashboardPresetBody,
} from 'src/modules/dashboard/dtos/save-dashboard-preset.input';
import {
  DashboardFiltersAndPresetsDTO,
  SaveDashboardPresetResponseDTO,
} from 'src/modules/dashboard/dtos/dashboard-preset-response.dto';
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
  ): Promise<DashboardFiltersAndPresetsDTO> {
    const [activeFilterState, presets] = await Promise.all([
      this.dashboardPresetService.getActiveFilterState(dashboardId),
      this.dashboardPresetService.getPresetsForDashboard(dashboardId),
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
  ): Promise<SaveDashboardPresetResponseDTO> {
    const preset = await this.dashboardPresetService.savePreset(
      dashboardId,
      body.name,
      body.filterState,
    );

    return {
      success: true,
      preset,
    };
  }
}
