import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
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

  @Mutation(() => SaveDashboardPresetResponseDTO)
  @UseGuards(NoPermissionGuard)
  async saveDashboardPreset(
    @Args('dashboardId', { type: () => UUIDScalarType }) dashboardId: string,
    @Args('name', { type: () => String }) name: string,
    @Args('filterState', { type: () => GraphQLJSON, nullable: true })
    filterState: Record<string, unknown> | null,
  ): Promise<SaveDashboardPresetResponseDTO> {
    const preset = await this.dashboardPresetService.savePreset(
      dashboardId,
      name,
      filterState,
    );

    return {
      success: true,
      preset,
    };
  }
}
