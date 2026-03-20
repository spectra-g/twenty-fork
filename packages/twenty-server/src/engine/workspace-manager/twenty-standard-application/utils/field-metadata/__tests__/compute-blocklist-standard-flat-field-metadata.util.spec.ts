import { FieldMetadataType } from 'twenty-shared/types';

jest.mock('twenty-shared/metadata', () => ({
  STANDARD_OBJECTS: jest.requireActual(
    '../../../../../../../../twenty-shared/src/metadata/constants/standard-object.constant',
  ).STANDARD_OBJECTS,
}));

import { buildBlocklistStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/compute-blocklist-standard-flat-field-metadata.util';
import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { buildStandardFlatObjectMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/build-standard-flat-object-metadata-maps.util';

describe('buildBlocklistStandardFlatFieldMetadatas', () => {
  it('should include description field metadata', () => {
    const standardObjectMetadataRelatedEntityIds =
      getStandardObjectMetadataRelatedEntityIds();
    const flatObjectMetadataMaps = buildStandardFlatObjectMetadataMaps({
      now: '2026-03-20T00:00:00.000Z',
      workspaceId: 'workspace-id',
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId: 'twenty-standard-application-id',
      dependencyFlatEntityMaps: {
        flatFieldMetadataMaps: {
          byId: {},
          idByUniversalIdentifier: {},
          universalIdentifierById: {},
          byUniversalIdentifier: {},
        },
      },
    });

    const result = buildBlocklistStandardFlatFieldMetadatas({
      now: '2026-03-20T00:00:00.000Z',
      objectName: 'blocklist',
      workspaceId: 'workspace-id',
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps: {
        flatObjectMetadataMaps,
      },
      twentyStandardApplicationId: 'twenty-standard-application-id',
    });

    expect(result.description).toMatchObject({
      name: 'description',
      label: 'Description',
      type: FieldMetadataType.TEXT,
      isNullable: true,
      icon: 'IconFileDescription',
      isUIReadOnly: true,
    });

    expect(result.searchVector.settings?.asExpression).toContain('description');
  });
});
