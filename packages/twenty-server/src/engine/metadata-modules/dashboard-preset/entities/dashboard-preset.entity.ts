import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { ViewVisibility } from 'twenty-shared/types';

import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

@Entity({ name: 'dashboardPreset', schema: 'core' })
@Index('IDX_DASHBOARD_PRESET_WORKSPACE_ID_PAGE_LAYOUT_ID', [
  'workspaceId',
  'pageLayoutId',
])
@Index('IDX_DASHBOARD_PRESET_VISIBILITY', ['visibility'])
export class DashboardPresetEntity
  extends SyncableEntity
  implements Required<DashboardPresetEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  pageLayoutId: string;

  @ManyToOne(() => PageLayoutEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pageLayoutId' })
  pageLayout: Relation<PageLayoutEntity>;

  @Column({ nullable: false, type: 'text', default: '' })
  name: string;

  @Column({ nullable: false, type: 'jsonb' })
  filter: JsonbProperty<Record<string, unknown>>;

  @Column({ nullable: false, type: 'uuid' })
  creatorId: string;

  @Column({
    type: 'enum',
    enum: Object.values(ViewVisibility),
    nullable: false,
    default: ViewVisibility.WORKSPACE,
  })
  visibility: ViewVisibility;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
