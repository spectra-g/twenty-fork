import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
  TEST_PERSON_3_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { TEST_PRIMARY_LINK_URL } from 'test/integration/constants/test-primary-link-url.constant';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

const TEST_WORKSPACE_SCHEMA_NAME = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const COMPANY_NAME_TRIGRAM_INDEX_NAME = generateDeterministicIndexNameV2({
  flatObjectMetadata: {
    nameSingular: 'company',
    isCustom: false,
  },
  orderedIndexColumnNames: ['name'],
});

const seedCompanyPerformanceFixtures = async (count: number) => {
  await global.testDataSource.query(
    `
      INSERT INTO "${TEST_WORKSPACE_SCHEMA_NAME}"."company" (
        "id",
        "name",
        "domainNamePrimaryLinkUrl",
        "addressAddressStreet1",
        "addressAddressStreet2",
        "addressAddressCity",
        "addressAddressState",
        "addressAddressPostcode",
        "addressAddressCountry",
        "employees",
        "position",
        "createdBySource",
        "createdByWorkspaceMemberId",
        "createdByName",
        "updatedBySource",
        "updatedByWorkspaceMemberId",
        "updatedByName"
      )
      SELECT
        uuid_generate_v4(),
        CASE
          WHEN value = 1 THEN 'Acme Corporation'
          ELSE 'Load Test Company ' || value::text
        END,
        'https://load-test-company-' || value::text || '.example.com',
        '1 Market Street',
        NULL,
        'San Francisco',
        'CA',
        '94105',
        'United States',
        10,
        1000 + value,
        'SYSTEM',
        NULL,
        'System',
        'SYSTEM',
        NULL,
        'System'
      FROM generate_series(1, $1) AS value
    `,
    [count],
  );
};

describe('Core REST API Find Duplicates endpoint', () => {
  beforeAll(async () => {
    await deleteAllRecords('person');
    await deleteAllRecords('company');

    await makeRestAPIRequest({
      method: 'post',
      path: '/companies',
      body: {
        id: TEST_COMPANY_1_ID,
        name: 'Rest Harness Company',
        domainName: {
          primaryLinkUrl: TEST_PRIMARY_LINK_URL,
        },
      },
    }).expect(201);

    await makeRestAPIRequest({
      method: 'post',
      path: '/batch/companies',
      body: [
        {
          id: '00000000-0000-4000-8000-000000000101',
          name: 'Acme Corporation',
          domainName: {
            primaryLinkUrl: 'https://acme.example.com',
          },
        },
        {
          id: '00000000-0000-4000-8000-000000000102',
          name: 'BetaCorp',
          domainName: {
            primaryLinkUrl: 'https://betacorp.example.com',
          },
        },
        {
          id: '00000000-0000-4000-8000-000000000104',
          name: 'Gamma Corporation',
          domainName: {
            primaryLinkUrl: 'https://gamma.example.com',
          },
        },
        {
          id: '00000000-0000-4000-8000-000000000103',
          name: 'Other Company',
          domainName: {
            primaryLinkUrl: 'https://exact-domain.example.com',
          },
        },
      ],
    }).expect(201);

    await makeRestAPIRequest({
      method: 'post',
      path: '/batch/people',
      body: [
        {
          id: TEST_PERSON_1_ID,
          companyId: TEST_COMPANY_1_ID,
          name: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        {
          id: TEST_PERSON_2_ID,
          companyId: TEST_COMPANY_1_ID,
          name: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        {
          id: TEST_PERSON_3_ID,
          companyId: TEST_COMPANY_1_ID,
          name: {
            firstName: 'Phil',
            lastName: 'Collins',
          },
        },
      ],
    }).expect(201);
  });

  it('should retrieve duplicates by object data', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        data: [
          {
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data.length).toBe(1);
    const duplicatesInfo = data[0];

    expect(duplicatesInfo.totalCount).toBe(2);
    expect(duplicatesInfo.personDuplicates.length).toBe(2);

    const [personDuplicated1, personDuplicated2] =
      duplicatesInfo.personDuplicates;

    expect(personDuplicated1.id).toBe(TEST_PERSON_1_ID);
    expect(personDuplicated2.id).toBe(TEST_PERSON_2_ID);
  });

  it('should retrieve duplicates by ids', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        ids: [TEST_PERSON_1_ID],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data.length).toBe(1);
    const duplicatesInfo = data[0];

    expect(duplicatesInfo.totalCount).toBe(1);
    expect(duplicatesInfo.personDuplicates.length).toBe(1);

    const [personDuplicated] = duplicatesInfo.personDuplicates;

    expect(personDuplicated.id).toBe(TEST_PERSON_2_ID);
  });

  it('should not provide wrong duplicates', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        data: [
          {
            name: {
              firstName: 'Not',
              lastName: 'Existing',
            },
          },
        ],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data.length).toBe(1);
    const duplicatesInfo = data[0];

    expect(duplicatesInfo.totalCount).toBe(0);
    expect(duplicatesInfo.personDuplicates.length).toBe(0);
  });

  it('should return 400 error when empty object data provided', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        data: [],
      },
    }).expect(400);

    expect(response.body.messages[0]).toContain(
      'The "data" condition can not be empty when "ids" input not provided',
    );
    expect(response.body.error).toBe('BadRequestException');
  });

  it('should return empty result when empty ids provided', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        ids: [],
      },
    }).expect(200);

    expect(response.body.data.length).toBe(0);
  });

  it('should return 400 error when ids and data are provided', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates`,
      body: {
        data: [],
        ids: [],
      },
    }).expect(400);

    expect(response.body.messages[0]).toContain(
      'You cannot provide both "data" and "ids" arguments',
    );
    expect(response.body.error).toBe('BadRequestException');
  });

  it('should support depth 0 parameter', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates?depth=0`,
      body: {
        data: [
          {
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data.length).toBe(1);
    const duplicatesInfo = data[0];

    const [personDuplicated1, personDuplicated2] =
      duplicatesInfo.personDuplicates;

    expect(personDuplicated1.companyId).toBe(TEST_COMPANY_1_ID);
    expect(personDuplicated1.company).not.toBeDefined();
    expect(personDuplicated2.companyId).toBe(TEST_COMPANY_1_ID);
    expect(personDuplicated2.company).not.toBeDefined();
  });

  it('should support depth 1 parameter', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates?depth=1`,
      body: {
        data: [
          {
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data.length).toBe(1);
    const duplicatesInfo = data[0];

    const [personDuplicated1, personDuplicated2] =
      duplicatesInfo.personDuplicates;

    expect(personDuplicated1.company).toBeDefined();
    expect(personDuplicated1.company.id).toBe(TEST_COMPANY_1_ID);
    expect(personDuplicated1.company.people).not.toBeDefined();

    expect(personDuplicated2.company).toBeDefined();
    expect(personDuplicated2.company.id).toBe(TEST_COMPANY_1_ID);
    expect(personDuplicated2.company.people).not.toBeDefined();
  });

  it('should not support depth 2 parameter', async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/people/duplicates?depth=2`,
      body: {
        data: [
          {
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
      },
    }).expect(400);
  });

  it('should retrieve company duplicates by case-insensitive name', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            name: 'acme corporation',
          },
        ],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data).toHaveLength(1);
    expect(data[0].totalCount).toBe(1);
    expect(data[0].companyDuplicates).toHaveLength(1);
    expect(data[0].companyDuplicates[0].name).toBe('Acme Corporation');
  });

  it('should retrieve company duplicates despite spacing variations', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            name: 'Beta Corp',
          },
        ],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data).toHaveLength(1);
    expect(data[0].totalCount).toBe(1);
    expect(data[0].companyDuplicates).toHaveLength(1);
    expect(data[0].companyDuplicates[0].name).toBe('BetaCorp');
  });

  it('should retrieve company duplicates despite minor suffix variation', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            name: 'GAMMA Corp',
          },
        ],
      },
    }).expect(200);

    const data = response.body.data;

    expect(data).toHaveLength(1);
    expect(data[0].totalCount).toBe(1);
    expect(data[0].companyDuplicates).toHaveLength(1);
    expect(data[0].companyDuplicates[0].name).toBe('Gamma Corporation');
  });

  it('should retrieve company duplicates for ACME Corp within 1 second on 10000 companies', async () => {
    await deleteAllRecords('company');
    await seedCompanyPerformanceFixtures(10000);

    const startedAt = performance.now();

    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            name: 'ACME Corp',
          },
        ],
      },
    }).expect(200);

    const elapsedMs = performance.now() - startedAt;
    const data = response.body.data;

    expect(data).toHaveLength(1);
    expect(data[0].companyDuplicates.some(({ name }) => name === 'Acme Corporation')).toBe(true);
    expect(elapsedMs).toBeLessThan(1000);
  });

  it('should use the company name trigram index for tolerant duplicate lookup', async () => {
    const explainResult = await global.testDataSource.query(
      `
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT "id"
        FROM "${TEST_WORKSPACE_SCHEMA_NAME}"."company"
        WHERE "name" % $1
      `,
      ['ACME Corp'],
    );

    const plan = explainResult[0]['QUERY PLAN'][0].Plan;
    const serializedPlan = JSON.stringify(plan);

    expect(serializedPlan).toContain('Index');
    expect(serializedPlan).toContain(COMPANY_NAME_TRIGRAM_INDEX_NAME);
    expect(serializedPlan).not.toContain('Seq Scan');
  });

  it('should keep domain duplicate matching exact after normalization', async () => {
    const exactResponse = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            domainName: {
              primaryLinkUrl: 'https://EXACT-DOMAIN.EXAMPLE.COM',
            },
          },
        ],
      },
    }).expect(200);

    expect(exactResponse.body.data).toHaveLength(1);
    expect(exactResponse.body.data[0].totalCount).toBe(1);
    expect(exactResponse.body.data[0].companyDuplicates).toHaveLength(1);
    expect(exactResponse.body.data[0].companyDuplicates[0].name).toBe(
      'Other Company',
    );

    const fuzzyResponse = await makeRestAPIRequest({
      method: 'post',
      path: '/companies/duplicates',
      body: {
        data: [
          {
            domainName: {
              primaryLinkUrl: 'https://exact-domains.example.com',
            },
          },
        ],
      },
    }).expect(200);

    expect(fuzzyResponse.body.data).toHaveLength(1);
    expect(fuzzyResponse.body.data[0].totalCount).toBe(0);
    expect(fuzzyResponse.body.data[0].companyDuplicates).toHaveLength(0);
  });
});
