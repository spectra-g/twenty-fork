import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { ADD_BLOCKLIST_DESCRIPTION_FIELD_TO_STANDARD_OBJECTS_1772000000000 } from 'src/database/commands/upgrade-version-command/workspace-migrations/1772000000000-add-blocklist-description-field-to-standard-objects';

const BLOCKLIST_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-4be3-44a7-9871-5f5e5d3c0d51';

describe('ADD_BLOCKLIST_DESCRIPTION_FIELD_TO_STANDARD_OBJECTS_1772000000000', () => {
  it(
    'should create the standard Blocklist description field as nullable text metadata',
    () => {
    expect(
      ADD_BLOCKLIST_DESCRIPTION_FIELD_TO_STANDARD_OBJECTS_1772000000000.actions,
    ).toHaveLength(1);

    expect(
      ADD_BLOCKLIST_DESCRIPTION_FIELD_TO_STANDARD_OBJECTS_1772000000000.actions[0],
    ).toMatchObject({
      type: 'create',
      metadataName: 'fieldMetadata',
      flatEntity: {
        type: FieldMetadataType.TEXT,
        name: 'description',
        label: 'Description',
        description: 'Description',
        icon: 'IconFileDescription',
        isCustom: false,
        isActive: true,
        isSystem: false,
        isNullable: true,
        isUnique: false,
        isUIReadOnly: true,
        standardOverrides: null,
        defaultValue: null,
        options: null,
        morphId: null,
        objectMetadataUniversalIdentifier:
          STANDARD_OBJECTS.blocklist.universalIdentifier,
        universalIdentifier: BLOCKLIST_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
        relationTargetObjectMetadataUniversalIdentifier: null,
        relationTargetFieldMetadataUniversalIdentifier: null,
        universalSettings: null,
      },
    });
    },
  );
});
