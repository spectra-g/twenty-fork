import { type FilterObjectDTO } from 'src/modules/dashboard/dtos/filter.dto';
import { PresetVisibility } from 'src/modules/dashboard/enums/preset-visibility.enum';

export type PresetDTO = {
  id: string;
  dashboardId: string;
  ownerId: string;
  name: string;
  filters: FilterObjectDTO;
  visibility: PresetVisibility;
  teamIds?: string[];
  editorIds?: string[];
};

export type CreatePresetDTO = Omit<PresetDTO, 'id' | 'ownerId'>;

export type UpdatePresetDTO = Partial<
  Omit<PresetDTO, 'id' | 'dashboardId' | 'ownerId'>
>;
