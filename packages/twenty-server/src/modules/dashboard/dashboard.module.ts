import { Module } from '@nestjs/common';

import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { DashboardPresetModule } from 'src/engine/metadata-modules/dashboard-preset/dashboard-preset.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { ChartDataModule } from 'src/modules/dashboard/chart-data/chart-data.module';
import { DashboardController } from 'src/modules/dashboard/controllers/dashboard.controller';
import { CreateDashboardPresetPermissionGuard } from 'src/modules/dashboard/guards/create-dashboard-preset-permission.guard';
import { UpdateDashboardPresetPermissionGuard } from 'src/modules/dashboard/guards/update-dashboard-preset-permission.guard';
import { DashboardResolver } from 'src/modules/dashboard/resolvers/dashboard.resolver';
import { DashboardAccessService } from 'src/modules/dashboard/services/dashboard-access.service';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';
import { DashboardFilterService } from 'src/modules/dashboard/services/dashboard-filter.service';

@Module({
  imports: [
    ActorModule,
    AuthModule,
    ChartDataModule,
    DashboardPresetModule,
    PageLayoutModule,
    PermissionsModule,
    TwentyORMModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [DashboardController],
  providers: [
    CreateDashboardPresetPermissionGuard,
    DashboardAccessService,
    DashboardDuplicationService,
    DashboardFilterService,
    DashboardResolver,
    UpdateDashboardPresetPermissionGuard,
  ],
  exports: [DashboardDuplicationService, DashboardFilterService],
})
export class DashboardModule {}
