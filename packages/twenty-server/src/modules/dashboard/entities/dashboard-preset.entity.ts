import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { type ChartFilter } from 'twenty-shared/types';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'dashboardPreset', schema: 'core' })
@Index('IDX_DASHBOARD_PRESET_WORKSPACE_ID_DASHBOARD_ID', [
  'workspaceId',
  'dashboardId',
])
export class DashboardPresetEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  dashboardId: string;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'jsonb' })
  filterState: ChartFilter;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
