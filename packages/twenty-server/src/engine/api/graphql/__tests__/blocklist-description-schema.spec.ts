import {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLString,
  isNonNullType,
} from 'graphql';

jest.mock('twenty-shared/metadata', () => ({
  STANDARD_OBJECTS: jest.requireActual(
    '../../../../../../twenty-shared/src/metadata/constants/standard-object.constant',
  ).STANDARD_OBJECTS,
}));

import { ArgsTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/args-type/args-type.generator';
import { ObjectMetadataCreateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/create-input/object-metadata-create-gql-input-type.generator';
import { RelationFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-field-metadata-gql-type.generator';
import { ObjectMetadataUpdateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/update-input/object-metadata-update-gql-input-type.generator';
import { ObjectMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/object-metadata-gql-object-type.generator';
import { RelationFieldMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/relation-field-metadata-gql-object-type.generator';
import { getResolverArgs } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-resolver-args.util';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const unwrapNonNullType = <T>(type: T) => {
  return isNonNullType(type) ? type.ofType : type;
};

const buildBlocklistGraphqlContract = () => {
  const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
    {
      now: '2026-03-20T00:00:00.000Z',
      workspaceId: 'workspace-id',
      twentyStandardApplicationId: 'twenty-standard-application-id',
    },
  );

  const blocklistObjectMetadata = Object.values(
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  ).find((objectMetadata) => objectMetadata?.nameSingular === 'blocklist');

  if (!blocklistObjectMetadata) {
    throw new Error('Expected standard object metadata for blocklist');
  }

  const allFieldMetadata = Object.values(
    allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter((fieldMetadata) => fieldMetadata);
  const blocklistFields = allFieldMetadata.filter(
    (fieldMetadata) =>
      fieldMetadata.objectMetadataId === blocklistObjectMetadata.id &&
      ['id', 'handle', 'description'].includes(fieldMetadata.name),
  );

  const gqlTypesStorage = new GqlTypesStorage();
  const typeMapperService = new TypeMapperService();
  const relationFieldMetadataGqlObjectTypeGenerator =
    new RelationFieldMetadataGqlObjectTypeGenerator(typeMapperService);
  const relationFieldMetadataGqlInputTypeGenerator =
    new RelationFieldMetadataGqlInputTypeGenerator(
      typeMapperService,
      gqlTypesStorage,
    );
  const objectMetadataGqlObjectTypeGenerator =
    new ObjectMetadataGqlObjectTypeGenerator(
      relationFieldMetadataGqlObjectTypeGenerator,
      gqlTypesStorage,
      typeMapperService,
    );
  const objectMetadataCreateGqlInputTypeGenerator =
    new ObjectMetadataCreateGqlInputTypeGenerator(
      gqlTypesStorage,
      relationFieldMetadataGqlInputTypeGenerator,
      typeMapperService,
    );
  const objectMetadataUpdateGqlInputTypeGenerator =
    new ObjectMetadataUpdateGqlInputTypeGenerator(
      gqlTypesStorage,
      relationFieldMetadataGqlInputTypeGenerator,
      typeMapperService,
    );
  const argsTypeGenerator = new ArgsTypeGenerator(
    typeMapperService,
    gqlTypesStorage,
  );

  const context = {
    flatObjectMetadataMaps: allFlatEntityMaps.flatObjectMetadataMaps,
    flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
    flatIndexMaps: allFlatEntityMaps.flatIndexMaps,
  };

  objectMetadataGqlObjectTypeGenerator.buildAndStore(
    blocklistObjectMetadata,
    blocklistFields,
  );
  objectMetadataCreateGqlInputTypeGenerator.buildAndStore(
    blocklistObjectMetadata,
    blocklistFields,
    context,
  );
  objectMetadataUpdateGqlInputTypeGenerator.buildAndStore(
    blocklistObjectMetadata,
    blocklistFields,
    context,
  );

  const blocklistType = gqlTypesStorage.getGqlTypeByKey(
    computeObjectMetadataObjectTypeKey(
      'blocklist',
      ObjectTypeDefinitionKind.Plain,
    ),
  );
  const createInputType = gqlTypesStorage.getGqlTypeByKey(
    computeObjectMetadataInputTypeKey(
      'blocklist',
      GqlInputTypeDefinitionKind.Create,
    ),
  );
  const updateInputType = gqlTypesStorage.getGqlTypeByKey(
    computeObjectMetadataInputTypeKey(
      'blocklist',
      GqlInputTypeDefinitionKind.Update,
    ),
  );

  return {
    blocklistType,
    createInputType,
    updateInputType,
    createArgs: argsTypeGenerator.generate({
      args: getResolverArgs('createOne'),
      objectMetadataSingularName: 'blocklist',
    }),
    updateArgs: argsTypeGenerator.generate({
      args: getResolverArgs('updateOne'),
      objectMetadataSingularName: 'blocklist',
    }),
  };
};

describe('Blocklist GraphQL contract', () => {
  it('should expose description as an optional String field on Blocklist', () => {
    const { blocklistType } = buildBlocklistGraphqlContract();

    expect(blocklistType).toBeInstanceOf(GraphQLObjectType);

    const descriptionField = (
      blocklistType as GraphQLObjectType
    ).getFields().description;

    expect(descriptionField).toBeDefined();
    expect(descriptionField.type).toBe(GraphQLString);
  });

  it('should expose description as an optional String field on BlocklistCreateInput and createBlocklist data', () => {
    const { createInputType, createArgs } = buildBlocklistGraphqlContract();

    expect(createInputType).toBeInstanceOf(GraphQLInputObjectType);

    const descriptionField = (
      createInputType as GraphQLInputObjectType
    ).getFields().description;

    expect(descriptionField).toBeDefined();
    expect(descriptionField.type).toBe(GraphQLString);
    expect(unwrapNonNullType(createArgs.data.type)).toBe(createInputType);
    expect(isNonNullType(descriptionField.type)).toBe(false);
  });

  it('should expose description as an optional String field on BlocklistUpdateInput and updateBlocklist data', () => {
    const { updateInputType, updateArgs } = buildBlocklistGraphqlContract();

    expect(updateInputType).toBeInstanceOf(GraphQLInputObjectType);

    const descriptionField = (
      updateInputType as GraphQLInputObjectType
    ).getFields().description;

    expect(descriptionField).toBeDefined();
    expect(descriptionField.type).toBe(GraphQLString);
    expect(unwrapNonNullType(updateArgs.data.type)).toBe(updateInputType);
  });
});
