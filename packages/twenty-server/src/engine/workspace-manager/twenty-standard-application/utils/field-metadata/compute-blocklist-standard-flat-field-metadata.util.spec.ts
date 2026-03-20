import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { buildBlocklistStandardFlatFieldMetadatas } from './compute-blocklist-standard-flat-field-metadata.util';

const now = '2026-03-20T12:00:00.000Z';

describe('buildBlocklistStandardFlatFieldMetadatas', () => {
  it('should declare a shared metadata identifier for the blocklist description field', () => {
    expect(STANDARD_OBJECTS.blocklist.fields.description).toEqual({
      universalIdentifier: expect.any(String),
    });
  });

  it('should build description flat field metadata as a nullable text field', () => {
    const fieldMetadatas = buildBlocklistStandardFlatFieldMetadatas({
      now,
      objectName: 'blocklist',
      workspaceId: 'workspace-id',
      standardObjectMetadataRelatedEntityIds: {
        blocklist: {
          id: 'object-metadata-id',
          fields: {
            id: { id: 'field-id-id' },
            createdAt: { id: 'field-created-at-id' },
            updatedAt: { id: 'field-updated-at-id' },
            deletedAt: { id: 'field-deleted-at-id' },
            createdBy: { id: 'field-created-by-id' },
            updatedBy: { id: 'field-updated-by-id' },
            position: { id: 'field-position-id' },
            searchVector: { id: 'field-search-vector-id' },
            handle: { id: 'field-handle-id' },
            description: { id: 'field-description-id' },
            workspaceMember: { id: 'field-workspace-member-id' },
          },
        },
        workspaceMember: {
          id: 'workspace-member-object-metadata-id',
          fields: {
            blocklist: { id: 'workspace-member-blocklist-field-id' },
          },
        },
      } as never,
      dependencyFlatEntityMaps: {} as never,
      twentyStandardApplicationId: 'twenty-standard-application-id',
    });

    expect(fieldMetadatas.description).toMatchObject({
      name: 'description',
      type: FieldMetadataType.TEXT,
      label: 'Description',
      description: 'Description',
      icon: 'IconFileDescription',
      isNullable: true,
      isUIReadOnly: true,
    });
  });
});
