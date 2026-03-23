jest.mock('twenty-shared/metadata', () => ({
  STANDARD_OBJECTS: jest.requireActual(
    '../../../../../../../twenty-shared/src/metadata/constants/standard-object.constant',
  ).STANDARD_OBJECTS,
}));

import { FieldMetadataType } from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

describe('computeTwentyStandardApplicationAllFlatEntityMaps', () => {
  it('AC-001 should register a nullable description field for blocklist records', () => {
    const {
      allFlatEntityMaps: { flatFieldMetadataMaps },
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: '2026-03-23T00:00:00.000Z',
      workspaceId: 'workspace-id',
      twentyStandardApplicationId: 'application-id',
    });

    const descriptionField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.blocklist.fields.description.universalIdentifier
      ];

    expect(descriptionField).toBeDefined();
    expect(descriptionField).toMatchObject({
      name: 'description',
      type: FieldMetadataType.TEXT,
      isNullable: true,
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.blocklist.universalIdentifier,
    });
  });

  it('AC-002 should keep blocklist description registered in the standard object contract', () => {
    expect(STANDARD_OBJECTS.blocklist.fields.description).toEqual({
      universalIdentifier: expect.any(String),
    });
  });

  it('AC-003 should expose blocklist description in the generated metadata graph', () => {
    const {
      allFlatEntityMaps: { flatFieldMetadataMaps },
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: '2026-03-23T00:00:00.000Z',
      workspaceId: 'workspace-id',
      twentyStandardApplicationId: 'application-id',
    });

    const blocklistFields = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(
      (fieldMetadata) =>
        fieldMetadata.objectMetadataUniversalIdentifier ===
        STANDARD_OBJECTS.blocklist.universalIdentifier,
    );

    expect(
      blocklistFields.map((fieldMetadata) => fieldMetadata.name),
    ).toContain('description');
  });
});
