import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { type ChartFilter } from 'twenty-shared/types';

@Entity({ name: 'dashboardPreset', schema: 'core' })
@Index('IDX_DASHBOARD_PRESET_DASHBOARD_ID', ['dashboardId'])
@Index('IDX_DASHBOARD_PRESET_NAME_BY_DASHBOARD', ['dashboardId', 'name'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
export class DashboardPresetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  dashboardId: string;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'jsonb' })
  filter: ChartFilter;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
