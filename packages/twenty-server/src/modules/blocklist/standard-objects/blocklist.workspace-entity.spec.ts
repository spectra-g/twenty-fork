import { FieldMetadataType } from 'twenty-shared/types';

import {
  BlocklistWorkspaceEntity,
  SEARCH_FIELDS_FOR_BLOCKLIST,
} from './blocklist.workspace-entity';

describe('BlocklistWorkspaceEntity', () => {
  it('should type description as nullable text without changing search fields', () => {
    const descriptionValues: Array<BlocklistWorkspaceEntity['description']> = [
      'A persisted description',
      null,
    ];

    expect(descriptionValues).toEqual(['A persisted description', null]);
    expect(SEARCH_FIELDS_FOR_BLOCKLIST).toEqual([
      {
        name: 'handle',
        type: FieldMetadataType.TEXT,
      },
    ]);
  });
});
