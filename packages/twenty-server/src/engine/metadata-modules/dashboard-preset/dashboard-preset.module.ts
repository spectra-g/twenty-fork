import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardPresetEntity } from 'src/engine/metadata-modules/dashboard-preset/entities/dashboard-preset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardPresetEntity])],
  exports: [TypeOrmModule],
})
export class DashboardPresetModule {}
