import { randomUUID } from 'crypto';

import {
  createBarChartConfiguration,
  createChartTestPerson,
  destroyChartTestPeople,
  getPersonChartMetadata,
  queryBarChartData,
} from 'test/integration/dashboard/chart-data/utils/chart-data-filter-test.util';

describe('AC-001 chart-data filter intersection', () => {
  const createdRecordIds: string[] = [];
  let personChartMetadata: Awaited<ReturnType<typeof getPersonChartMetadata>>;

  beforeAll(async () => {
    personChartMetadata = await getPersonChartMetadata();
  });

  afterEach(async () => {
    await destroyChartTestPeople(createdRecordIds.splice(0));
  });

  it('returns only records matching both local and dashboard-global filters', async () => {
    const suffix = randomUUID();
    const matchingCity = `City-${suffix}`;
    const excludedCity = `Other-${suffix}`;
    const matchingFirstName = `Alice-${suffix}`;

    createdRecordIds.push(
      await createChartTestPerson({
        city: matchingCity,
        firstName: matchingFirstName,
      }),
    );
    createdRecordIds.push(
      await createChartTestPerson({
        city: matchingCity,
        firstName: `Bob-${suffix}`,
      }),
    );
    createdRecordIds.push(
      await createChartTestPerson({
        city: excludedCity,
        firstName: matchingFirstName,
      }),
    );

    const response = await queryBarChartData({
      objectMetadataId: personChartMetadata.objectMetadataId,
      configuration: createBarChartConfiguration({
        aggregateFieldMetadataId: personChartMetadata.fieldMetadataIds.id,
        primaryAxisGroupByFieldMetadataId:
          personChartMetadata.fieldMetadataIds.city,
        filter: {
          recordFilters: [
            {
              fieldMetadataId: personChartMetadata.fieldMetadataIds.city,
              operand: 'IS',
              value: matchingCity,
            },
          ],
          recordFilterGroups: [],
        },
      }),
      dashboardGlobalFilters: {
        recordFilters: [
          {
            fieldMetadataId: personChartMetadata.fieldMetadataIds.name,
            operand: 'IS',
            value: matchingFirstName,
            subFieldName: 'firstName',
          },
        ],
        recordFilterGroups: [],
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.barChartData.data).toEqual([
      {
        city: matchingCity,
        id: 1,
      },
    ]);
  });
});
