import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

export class DashboardPresetWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  dashboard: EntityRelation<DashboardWorkspaceEntity>;
  dashboardId: string;
  createdByUserWorkspaceId?: string | null;
  filterState: Record<string, unknown> | null;
  lastUsedAt: Date;
}
