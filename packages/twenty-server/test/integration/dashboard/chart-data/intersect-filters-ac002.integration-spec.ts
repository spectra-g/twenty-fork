import { randomUUID } from 'crypto';

import {
  createBarChartConfiguration,
  createChartTestPerson,
  destroyChartTestPeople,
  getPersonChartMetadata,
  queryBarChartData,
} from 'test/integration/dashboard/chart-data/utils/chart-data-filter-test.util';

describe('AC-002 chart-data global-only filters', () => {
  const createdRecordIds: string[] = [];
  let personChartMetadata: Awaited<ReturnType<typeof getPersonChartMetadata>>;

  beforeAll(async () => {
    personChartMetadata = await getPersonChartMetadata();
  });

  afterEach(async () => {
    await destroyChartTestPeople(createdRecordIds.splice(0));
  });

  it('returns records matching dashboard-global filters when no local filter exists', async () => {
    const suffix = randomUUID();
    const firstCity = `City-A-${suffix}`;
    const secondCity = `City-B-${suffix}`;
    const matchingFirstName = `Alice-${suffix}`;

    createdRecordIds.push(
      await createChartTestPerson({
        city: firstCity,
        firstName: matchingFirstName,
      }),
    );
    createdRecordIds.push(
      await createChartTestPerson({
        city: secondCity,
        firstName: matchingFirstName,
      }),
    );
    createdRecordIds.push(
      await createChartTestPerson({
        city: secondCity,
        firstName: `Bob-${suffix}`,
      }),
    );

    const response = await queryBarChartData({
      objectMetadataId: personChartMetadata.objectMetadataId,
      configuration: createBarChartConfiguration({
        aggregateFieldMetadataId: personChartMetadata.fieldMetadataIds.id,
        primaryAxisGroupByFieldMetadataId:
          personChartMetadata.fieldMetadataIds.city,
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
        city: firstCity,
        id: 1,
      },
      {
        city: secondCity,
        id: 1,
      },
    ]);
  });
});
