import { FieldMetadataType } from 'twenty-shared/types';

jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util',
  () => ({
    createStandardFieldFlatMetadata: jest.fn((args) => args.context),
  }),
);

jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util',
  () => ({
    createStandardRelationFieldFlatMetadata: jest.fn((args) => args.context),
  }),
);

import { buildBlocklistStandardFlatFieldMetadatas } from './compute-blocklist-standard-flat-field-metadata.util';
import {
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';

describe('buildBlocklistStandardFlatFieldMetadatas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should expose the description field with calendar-event parity metadata', () => {
    const fieldMetadatas = buildBlocklistStandardFlatFieldMetadatas({
      now: '2026-03-24T12:00:00.000Z',
      objectName: 'blocklist',
      workspaceId: 'workspace-id',
      standardObjectMetadataRelatedEntityIds: {} as never,
      dependencyFlatEntityMaps: {} as never,
      twentyStandardApplicationId: 'twenty-standard-application-id',
    });

    expect(fieldMetadatas.description).toMatchObject({
      fieldName: 'description',
      type: FieldMetadataType.TEXT,
      label: 'Description',
      icon: 'IconFileDescription',
      isNullable: true,
      isUIReadOnly: true,
    });
    expect(createStandardFieldFlatMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          fieldName: 'description',
          type: FieldMetadataType.TEXT,
          label: 'Description',
          icon: 'IconFileDescription',
          isNullable: true,
          isUIReadOnly: true,
        }),
      }),
    );
  });
});
