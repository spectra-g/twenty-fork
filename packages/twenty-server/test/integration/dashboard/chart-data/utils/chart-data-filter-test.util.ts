import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { isDefined } from 'twenty-shared/utils';

const BAR_CHART_DATA_QUERY = gql`
  query BarChartData($input: BarChartDataInput!) {
    barChartData(input: $input) {
      data
      indexBy
      keys
      formattedToRawLookup
    }
  }
`;

type ChartFilterInput = {
  recordFilters?: Array<{
    fieldMetadataId: string;
    operand: string;
    value?: string | null;
    subFieldName?: string | null;
  }>;
  recordFilterGroups?: Array<{
    id: string;
    logicalOperator: string;
    parentRecordFilterGroupId?: string | null;
  }>;
};

type PersonChartMetadata = {
  objectMetadataId: string;
  fieldMetadataIds: {
    id: string;
    city: string;
    name: string;
    createdAt: string;
  };
};

export const getPersonChartMetadata =
  async (): Promise<PersonChartMetadata> => {
    const { objects } = await findManyObjectMetadata({
      input: {
        filter: {},
        paging: {
          first: 100,
        },
      },
      gqlFields: 'id nameSingular fieldsList { id name }',
      expectToFail: false,
    });

    const personObject = objects.find(
      (object) => object.nameSingular === 'person',
    );

    if (!isDefined(personObject)) {
      throw new Error('Person object metadata not found');
    }

    const idField = personObject.fieldsList?.find(
      (field) => field.name === 'id',
    );
    const cityField = personObject.fieldsList?.find(
      (field) => field.name === 'city',
    );
    const nameField = personObject.fieldsList?.find(
      (field) => field.name === 'name',
    );
    const createdAtField = personObject.fieldsList?.find(
      (field) => field.name === 'createdAt',
    );

    if (
      !isDefined(idField) ||
      !isDefined(cityField) ||
      !isDefined(nameField) ||
      !isDefined(createdAtField)
    ) {
      throw new Error('Required person field metadata was not found');
    }

    return {
      objectMetadataId: personObject.id,
      fieldMetadataIds: {
        id: idField.id,
        city: cityField.id,
        name: nameField.id,
        createdAt: createdAtField.id,
      },
    };
  };

export const createChartTestPerson = async ({
  id = randomUUID(),
  city,
  firstName,
  createdAt,
}: {
  id?: string;
  city: string;
  firstName: string;
  createdAt?: string;
}) => {
  await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: `
        id
        city
        createdAt
        name {
          firstName
          lastName
        }
      `,
      data: {
        id,
        city,
        createdAt,
        name: {
          firstName,
          lastName: 'Chart Filter Test',
        },
      },
    }),
  );

  return id;
};

export const destroyChartTestPeople = async (recordIds: string[]) => {
  for (const recordId of recordIds) {
    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId,
      }),
    );
  }
};

export const queryBarChartData = async ({
  objectMetadataId,
  configuration,
  dashboardGlobalFilters,
}: {
  objectMetadataId: string;
  configuration: Record<string, unknown>;
  dashboardGlobalFilters?: ChartFilterInput;
}) =>
  makeGraphqlAPIRequest({
    query: BAR_CHART_DATA_QUERY,
    variables: {
      input: {
        objectMetadataId,
        configuration,
        dashboardGlobalFilters,
      },
    },
  });

export const createBarChartConfiguration = ({
  aggregateFieldMetadataId,
  primaryAxisGroupByFieldMetadataId,
  filter,
  timezone = 'UTC',
  primaryAxisDateGranularity,
}: {
  aggregateFieldMetadataId: string;
  primaryAxisGroupByFieldMetadataId: string;
  filter?: ChartFilterInput;
  timezone?: string;
  primaryAxisDateGranularity?: string;
}) => ({
  configurationType: 'BAR_CHART',
  layout: 'VERTICAL',
  aggregateFieldMetadataId,
  aggregateOperation: 'COUNT',
  primaryAxisGroupByFieldMetadataId,
  primaryAxisOrderBy: 'FIELD_ASC',
  axisNameDisplay: 'NONE',
  displayDataLabel: false,
  timezone,
  primaryAxisDateGranularity,
  filter,
});
