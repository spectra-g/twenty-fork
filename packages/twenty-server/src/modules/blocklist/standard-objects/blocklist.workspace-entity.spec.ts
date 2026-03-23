import { FieldMetadataType } from 'twenty-shared/types';

import { SEARCH_FIELDS_FOR_BLOCKLIST } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';

describe('BlocklistWorkspaceEntity', () => {
  it('should expose description as a searchable text field', () => {
    expect(SEARCH_FIELDS_FOR_BLOCKLIST).toEqual([
      { name: 'handle', type: FieldMetadataType.TEXT },
      { name: 'description', type: FieldMetadataType.TEXT },
    ]);
  });
});
