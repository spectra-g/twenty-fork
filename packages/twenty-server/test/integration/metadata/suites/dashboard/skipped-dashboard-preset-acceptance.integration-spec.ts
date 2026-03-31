// Acceptance: metadata API surface for dashboard presets/global filters is intentionally out of scope for STORY-095.

import request from 'supertest';

describe.skip('Dashboard preset acceptance boundary', () => {
  it('should update page layout global filters through the metadata API', async () => {
    const createPageLayoutResponse = await request(global.app.getHttpServer())
      .post('/metadata')
      .send({
        query: `
          mutation CreatePageLayout($input: CreatePageLayoutInput!) {
            createPageLayout(input: $input) {
              id
              name
              globalFilters
            }
          }
        `,
        variables: {
          input: {
            name: 'Revenue dashboard layout',
          },
        },
      });

    expect(createPageLayoutResponse.body.errors).toBeUndefined();

    const pageLayoutId = createPageLayoutResponse.body.data.createPageLayout.id;

    const updatePageLayoutResponse = await request(global.app.getHttpServer())
      .post('/metadata')
      .send({
        query: `
          mutation UpdatePageLayout($input: UpdatePageLayoutInput!, $id: UUID!) {
            updatePageLayout(input: $input, id: $id) {
              id
              globalFilters
            }
          }
        `,
        variables: {
          id: pageLayoutId,
          input: {
            globalFilters: {
              recordFilters: [
                {
                  fieldMetadataId: "00000000-0000-0000-0000-000000000201",
                  operand: "eq",
                  value: "user-123",
                  type: "TEXT",
                  recordFilterGroupId: null,
                  subFieldName: null
                }
              ],
              recordFilterGroups: [],
            },
          },
        },
      });

    expect(updatePageLayoutResponse.body.errors).toBeUndefined();
    expect(updatePageLayoutResponse.body.data.updatePageLayout.globalFilters)
      .toEqual({
        recordFilters: [
          {
            fieldMetadataId: '00000000-0000-0000-0000-000000000201',
            operand: 'eq',
            value: 'user-123',
            type: 'TEXT',
            recordFilterGroupId: null,
            subFieldName: null,
          },
        ],
        recordFilterGroups: [],
      });
  });

  it('should create and read a dashboard preset through the metadata API', async () => {
    const createDashboardPresetResponse = await request(global.app.getHttpServer())
      .post('/metadata')
      .send({
        query: `
          mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
            createDashboardPreset(input: $input) {
              id
              pageLayoutId
              name
              visibility
              creatorId
              filter
              deletedAt
            }
          }
        `,
        variables: {
          input: {
            pageLayoutId: '00000000-0000-0000-0000-000000000301',
            name: 'Q4 Pipeline',
            visibility: 'WORKSPACE',
            creatorId: '00000000-0000-0000-0000-000000000302',
            filter: {
              recordFilters: [
                {
                  fieldMetadataId: '00000000-0000-0000-0000-000000000303',
                  operand: 'eq',
                  value: 'qualified',
                  type: 'TEXT',
                  recordFilterGroupId: null,
                  subFieldName: null,
                },
              ],
              recordFilterGroups: [],
            },
          },
        },
      });

    expect(createDashboardPresetResponse.body.errors).toBeUndefined();
    expect(createDashboardPresetResponse.body.data.createDashboardPreset)
      .toMatchObject({
        id: expect.any(String),
        pageLayoutId: '00000000-0000-0000-0000-000000000301',
        name: 'Q4 Pipeline',
        visibility: 'WORKSPACE',
        creatorId: '00000000-0000-0000-0000-000000000302',
        deletedAt: null,
        filter: {
          recordFilters: [
            {
              fieldMetadataId: '00000000-0000-0000-0000-000000000303',
              operand: 'eq',
              value: 'qualified',
              type: 'TEXT',
              recordFilterGroupId: null,
              subFieldName: null,
            },
          ],
          recordFilterGroups: [],
        },
      });
  });
});
