import { randomUUID } from 'crypto';

import {
  createBarChartConfiguration,
  createChartTestPerson,
  destroyChartTestPeople,
  getPersonChartMetadata,
  queryBarChartData,
} from 'test/integration/dashboard/chart-data/utils/chart-data-filter-test.util';

describe('AC-003 chart-data local-only filters', () => {
  const createdRecordIds: string[] = [];
  let personChartMetadata: Awaited<ReturnType<typeof getPersonChartMetadata>>;

  beforeAll(async () => {
    personChartMetadata = await getPersonChartMetadata();
  });

  afterEach(async () => {
    await destroyChartTestPeople(createdRecordIds.splice(0));
  });

  it('keeps existing local-filter behavior when dashboard-global filters are omitted', async () => {
    const suffix = randomUUID();
    const matchingCity = `City-${suffix}`;
    const excludedCity = `Other-${suffix}`;

    createdRecordIds.push(
      await createChartTestPerson({
        city: matchingCity,
        firstName: `Alice-${suffix}`,
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
        firstName: `Carol-${suffix}`,
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
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.barChartData.data).toEqual([
      {
        city: matchingCity,
        id: 2,
      },
    ]);
  });
});
