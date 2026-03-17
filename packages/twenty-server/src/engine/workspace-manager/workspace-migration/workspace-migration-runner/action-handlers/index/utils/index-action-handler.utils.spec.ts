import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';

import { createIndexInWorkspaceSchema } from './index-action-handler.utils';

const mockFieldMetadataMaps = (): FlatEntityMaps<FlatFieldMetadata> => {
  const fieldMetadata = {
    id: 'field-name-id',
    universalIdentifier: 'field-name-universal-id',
    type: FieldMetadataType.TEXT,
    name: 'name',
  } as FlatFieldMetadata;

  return {
    byUniversalIdentifier: {
      [fieldMetadata.universalIdentifier]: fieldMetadata,
    },
    universalIdentifierById: {
      [fieldMetadata.id]: fieldMetadata.universalIdentifier,
    },
    universalIdentifiersByApplicationId: {},
  };
};

describe('createIndexInWorkspaceSchema', () => {
  it('should attach gin_trgm_ops to the company name trigram index', async () => {
    const createIndex = jest.fn();

    await createIndexInWorkspaceSchema({
      flatIndexMetadata: {
        name: 'IDX_company_name_trgm',
        universalIdentifier: '79b0e7d3-5f87-4aa3-9f0a-d5cba8f205b1',
        flatIndexFieldMetadatas: [
          {
            fieldMetadataId: 'field-name-id',
          },
        ],
      } as unknown as FlatIndexMetadata,
      flatObjectMetadata: {
        nameSingular: 'company',
        targetTableName: 'company',
      } as FlatObjectMetadata,
      flatFieldMetadataMaps: mockFieldMetadataMaps(),
      workspaceSchemaManagerService: {
        indexManager: {
          createIndex,
        },
      } as WorkspaceSchemaManagerService,
      queryRunner: {} as never,
      workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    });

    expect(createIndex).toHaveBeenCalledWith(
      expect.objectContaining({
        index: expect.objectContaining({
          columns: ['name'],
          columnOperatorClasses: ['gin_trgm_ops'],
        }),
      }),
    );
  });
});
