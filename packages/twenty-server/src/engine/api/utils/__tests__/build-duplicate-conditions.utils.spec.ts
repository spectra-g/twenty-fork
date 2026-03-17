import { FieldMetadataType } from 'twenty-shared/types';

import {
  mockPersonFlatFieldMetadataMaps,
  mockPersonFlatObjectMetadata,
  mockPersonFlatObjectMetadataMaps,
} from 'src/engine/api/graphql/graphql-query-runner/__mocks__/mockPersonObjectMetadata';
import { mockPersonRecords } from 'src/engine/api/graphql/graphql-query-runner/__mocks__/mockPersonRecords';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildDuplicateConditions } from 'src/engine/api/utils/build-duplicate-conditions.utils';

const companyObjectMetadataId = 'company-object-id';

const mockCompanyFieldMetadatas: FlatFieldMetadata[] = [
  {
    id: 'company-name-id',
    type: FieldMetadataType.TEXT,
    name: 'name',
    label: 'Name',
    defaultValue: "''",
    objectMetadataId: companyObjectMetadataId,
    isNullable: true,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    universalIdentifier: 'company-name-id',
    viewFieldIds: [],
    viewFilterIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    applicationId: null,
  } as unknown as FlatFieldMetadata,
  {
    id: 'company-domain-name-id',
    type: FieldMetadataType.LINKS,
    name: 'domainName',
    label: 'Domain Name',
    defaultValue: {
      primaryLinkUrl: "''",
      secondaryLinks: [],
      primaryLinkLabel: "''",
    },
    objectMetadataId: companyObjectMetadataId,
    isNullable: true,
    isLabelSyncedWithName: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    universalIdentifier: 'company-domain-name-id',
    viewFieldIds: [],
    viewFilterIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    applicationId: null,
  } as unknown as FlatFieldMetadata,
];

const mockCompanyFlatFieldMetadataMaps =
  (): FlatEntityMaps<FlatFieldMetadata> => ({
    byUniversalIdentifier: mockCompanyFieldMetadatas.reduce(
      (acc, field) => {
        acc[field.universalIdentifier] = field;

        return acc;
      },
      {} as Record<string, FlatFieldMetadata>,
    ),
    universalIdentifierById: mockCompanyFieldMetadatas.reduce(
      (acc, field) => {
        acc[field.id] = field.universalIdentifier;

        return acc;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  });

const mockCompanyFlatObjectMetadata = (): FlatObjectMetadata => ({
  id: companyObjectMetadataId,
  icon: 'IconBuildingSkyscraper',
  nameSingular: 'company',
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  targetTableName: 'company',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  duplicateCriteria: [['name'], ['domainNamePrimaryLinkUrl']],
  labelIdentifierFieldMetadataId: 'company-name-id',
  imageIdentifierFieldMetadataId: 'company-domain-name-id',
  workspaceId: 'workspace-id',
  universalIdentifier: companyObjectMetadataId,
  indexMetadataIds: [],
  fieldIds: mockCompanyFieldMetadatas.map((field) => field.id),
  viewIds: [],
  applicationId: 'test-application-id',
  isLabelSyncedWithName: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  shortcut: null,
  description: null,
  standardOverrides: null,
  isUIReadOnly: false,
  applicationUniversalIdentifier: 'test-application-id',
  fieldUniversalIdentifiers: mockCompanyFieldMetadatas.map(
    (field) => field.universalIdentifier,
  ),
  viewUniversalIdentifiers: [],
  indexMetadataUniversalIdentifiers: [],
  labelIdentifierFieldMetadataUniversalIdentifier: null,
  imageIdentifierFieldMetadataUniversalIdentifier: null,
});

const mockCompanyFlatObjectMetadataMaps =
  (): FlatEntityMaps<FlatObjectMetadata> => {
    const flatObjectMetadata = mockCompanyFlatObjectMetadata();

    return {
      byUniversalIdentifier: {
        [flatObjectMetadata.universalIdentifier as string]: flatObjectMetadata,
      },
      universalIdentifierById: {
        [flatObjectMetadata.id]: flatObjectMetadata.universalIdentifier as string,
      },
      universalIdentifiersByApplicationId: {},
    };
  };

describe('buildDuplicateConditions', () => {
  it('should build conditions based on duplicate criteria from composite field', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonFlatObjectMetadata([['emailsPrimaryEmail']]),
      mockPersonFlatObjectMetadataMaps([['emailsPrimaryEmail']]),
      mockPersonFlatFieldMetadataMaps(),
      mockPersonRecords,
      'recordId',
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          emails: {
            primaryEmail: {
              eq: 'test@test.fr',
            },
          },
        },
      ],
      id: {
        neq: 'recordId',
      },
    });
  });

  it('should build conditions based on duplicate criteria from basic field', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonFlatObjectMetadata([['jobTitle']]),
      mockPersonFlatObjectMetadataMaps([['jobTitle']]),
      mockPersonFlatFieldMetadataMaps(),
      mockPersonRecords,
      'recordId',
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          jobTitle: {
            eq: 'Test job',
          },
        },
      ],
      id: {
        neq: 'recordId',
      },
    });
  });

  it('should not build conditions based on duplicate criteria if record value is null or too small', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonFlatObjectMetadata([['linkedinLinkPrimaryLinkUrl']]),
      mockPersonFlatObjectMetadataMaps([['linkedinLinkPrimaryLinkUrl']]),
      mockPersonFlatFieldMetadataMaps(),
      mockPersonRecords,
      'recordId',
    );

    expect(duplicateConditons).toEqual({});
  });

  it('should build conditions based on duplicate criteria and without recordId filter', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonFlatObjectMetadata([['jobTitle']]),
      mockPersonFlatObjectMetadataMaps([['jobTitle']]),
      mockPersonFlatFieldMetadataMaps(),
      mockPersonRecords,
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          jobTitle: {
            eq: 'Test job',
          },
        },
      ],
    });
  });

  it('should build company name conditions with trigram matching', () => {
    const duplicateConditions = buildDuplicateConditions(
      mockCompanyFlatObjectMetadata(),
      mockCompanyFlatObjectMetadataMaps(),
      mockCompanyFlatFieldMetadataMaps(),
      [{ name: 'acme corporation' }],
    );

    expect(duplicateConditions).toEqual({
      or: [
        {
          name: {
            trigramSimilar: 'acme corporation',
          },
        },
      ],
    });
  });

  it('should normalize company name whitespace before trigram matching', () => {
    const duplicateConditions = buildDuplicateConditions(
      mockCompanyFlatObjectMetadata(),
      mockCompanyFlatObjectMetadataMaps(),
      mockCompanyFlatFieldMetadataMaps(),
      [{ name: '  Beta   Corp  ' }],
    );

    expect(duplicateConditions).toEqual({
      or: [
        {
          name: {
            trigramSimilar: 'Beta Corp',
          },
        },
      ],
    });
  });

  it('should keep company domain duplicate conditions exact on normalized values', () => {
    const duplicateConditions = buildDuplicateConditions(
      mockCompanyFlatObjectMetadata(),
      mockCompanyFlatObjectMetadataMaps(),
      mockCompanyFlatFieldMetadataMaps(),
      [
        {
          domainName: {
            primaryLinkUrl: 'HTTPS://EXACT-DOMAIN.EXAMPLE.COM',
          },
        },
      ],
    );

    expect(duplicateConditions).toEqual({
      or: [
        {
          domainName: {
            primaryLinkUrl: {
              eq: 'https://exact-domain.example.com',
            },
          },
        },
      ],
    });
  });
});
