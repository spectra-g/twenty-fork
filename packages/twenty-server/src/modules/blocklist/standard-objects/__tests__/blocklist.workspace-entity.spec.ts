import {
  BlocklistWorkspaceEntity,
  SEARCH_FIELDS_FOR_BLOCKLIST,
} from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { FieldMetadataType } from 'twenty-shared/types';

describe('BlocklistWorkspaceEntity', () => {
  it('should declare description on the entity shape', () => {
    const entity = new BlocklistWorkspaceEntity();

    expect(entity).toHaveProperty('description');
  });

  it('should include description in searchable blocklist fields', () => {
    expect(SEARCH_FIELDS_FOR_BLOCKLIST).toStrictEqual([
      {
        name: 'handle',
        type: FieldMetadataType.TEXT,
      },
      {
        name: 'description',
        type: FieldMetadataType.TEXT,
      },
    ]);
  });
});
