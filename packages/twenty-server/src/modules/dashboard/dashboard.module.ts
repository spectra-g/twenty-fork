import { Module } from '@nestjs/common';

import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { ChartDataModule } from 'src/modules/dashboard/chart-data/chart-data.module';
import { DashboardController } from 'src/modules/dashboard/controllers/dashboard.controller';
import { DashboardResolver } from 'src/modules/dashboard/resolvers/dashboard.resolver';
import { DashboardFilterPresetInMemoryRepository } from 'src/modules/dashboard/repositories/dashboard-filter-preset.in-memory.repository';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';
import {
  DASHBOARD_EXISTENCE_CHECKER,
  DASHBOARD_FILTER_PRESET_REPOSITORY,
  DashboardFilterPresetService,
} from 'src/modules/dashboard/services/dashboard-filter-preset.service';
import { DashboardService } from 'src/modules/dashboard/services/dashboard.service';

@Module({
  imports: [
    ActorModule,
    AuthModule,
    ChartDataModule,
    PageLayoutModule,
    TwentyORMModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [DashboardController],
  providers: [
    DashboardDuplicationService,
    {
      provide: DASHBOARD_FILTER_PRESET_REPOSITORY,
      useClass: DashboardFilterPresetInMemoryRepository,
    },
    {
      provide: DASHBOARD_EXISTENCE_CHECKER,
      useValue: {
        existsById: async () => true,
      },
    },
    DashboardFilterPresetService,
    DashboardService,
    DashboardResolver,
  ],
  exports: [DashboardDuplicationService, DashboardService],
})
export class DashboardModule {}
