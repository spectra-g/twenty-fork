import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

export type DashboardPreset = {
  id: string;
  name: string;
  filterState: Record<string, unknown>;
};

export type DashboardPresetJsonb = JsonbProperty<DashboardPreset[]>;
