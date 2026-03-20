import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';

const BLOCKLIST_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-4be3-44a7-9871-5f5e5d3c0d51';

export const ADD_BLOCKLIST_DESCRIPTION_FIELD_TO_STANDARD_OBJECTS_1772000000000 =
  {
    applicationUniversalIdentifier: '20202020-64aa-4b6f-b003-9c74b97cee20',
    actions: [
      {
        type: 'create',
        metadataName: 'fieldMetadata',
        flatEntity: {
          universalIdentifier: BLOCKLIST_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
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
          isLabelSyncedWithName: false,
          standardOverrides: null,
          defaultValue: null,
          options: null,
          morphId: null,
          createdAt: '2026-03-20T00:00:00.000Z',
          updatedAt: '2026-03-20T00:00:00.000Z',
          applicationUniversalIdentifier:
            '89590676-196d-4bc4-a3f5-1f068192068e',
          objectMetadataUniversalIdentifier:
            STANDARD_OBJECTS.blocklist.universalIdentifier,
          relationTargetObjectMetadataUniversalIdentifier: null,
          relationTargetFieldMetadataUniversalIdentifier: null,
          universalSettings: null,
        },
      },
    ],
  } as const satisfies WorkspaceMigration;
