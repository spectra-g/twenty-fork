import { randomUUID } from 'crypto';

import {
  createBarChartConfiguration,
  createChartTestPerson,
  destroyChartTestPeople,
  getPersonChartMetadata,
  queryBarChartData,
} from 'test/integration/dashboard/chart-data/utils/chart-data-filter-test.util';

describe('AC-004 chart-data date filter timezone semantics', () => {
  const createdRecordIds: string[] = [];
  let personChartMetadata: Awaited<ReturnType<typeof getPersonChartMetadata>>;

  beforeAll(async () => {
    personChartMetadata = await getPersonChartMetadata();
  });

  afterEach(async () => {
    await destroyChartTestPeople(createdRecordIds.splice(0));
  });

  it('preserves timezone-aware date filtering when local and dashboard-global filters are combined', async () => {
    const suffix = randomUUID();
    const matchingFirstName = `Alice-${suffix}`;

    createdRecordIds.push(
      await createChartTestPerson({
        city: `City-${suffix}`,
        firstName: matchingFirstName,
        createdAt: '2024-03-31T06:30:00.000Z',
      }),
    );
    createdRecordIds.push(
      await createChartTestPerson({
        city: `City-${suffix}`,
        firstName: matchingFirstName,
        createdAt: '2024-03-31T08:30:00.000Z',
      }),
    );
    createdRecordIds.push(
      await createChartTestPerson({
        city: `City-${suffix}`,
        firstName: `Bob-${suffix}`,
        createdAt: '2024-03-31T06:30:00.000Z',
      }),
    );

    const response = await queryBarChartData({
      objectMetadataId: personChartMetadata.objectMetadataId,
      configuration: createBarChartConfiguration({
        aggregateFieldMetadataId: personChartMetadata.fieldMetadataIds.id,
        primaryAxisGroupByFieldMetadataId:
          personChartMetadata.fieldMetadataIds.createdAt,
        primaryAxisDateGranularity: 'DAY',
        timezone: 'America/Los_Angeles',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: personChartMetadata.fieldMetadataIds.createdAt,
              operand: 'IS',
              value: '2024-03-30',
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
    expect(response.body.data.barChartData.data).toHaveLength(1);
    expect(response.body.data.barChartData.data[0].id).toBe(1);
  });
});
