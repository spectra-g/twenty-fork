import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { ChartDataModule } from 'src/modules/dashboard/chart-data/chart-data.module';
import { DashboardController } from 'src/modules/dashboard/controllers/dashboard.controller';
import { DashboardPresetEntity } from 'src/modules/dashboard/entities/dashboard-preset.entity';
import { DashboardPresetResolver } from 'src/modules/dashboard/resolvers/dashboard-preset.resolver';
import { DashboardResolver } from 'src/modules/dashboard/resolvers/dashboard.resolver';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';
import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';

@Module({
  imports: [
    ActorModule,
    AuthModule,
    ChartDataModule,
    PageLayoutModule,
    TypeOrmModule.forFeature([DashboardPresetEntity]),
    TwentyORMModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [DashboardController],
  providers: [
    DashboardDuplicationService,
    DashboardPresetResolver,
    DashboardPresetService,
    DashboardResolver,
  ],
  exports: [DashboardDuplicationService, DashboardPresetService],
})
export class DashboardModule {}
