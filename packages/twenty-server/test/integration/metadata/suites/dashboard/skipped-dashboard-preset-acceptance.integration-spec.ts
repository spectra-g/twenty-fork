// Acceptance: requires live stack — enable in CI or local dev with full environment running.

import { randomUUID } from 'crypto';

import request from 'supertest';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { ViewVisibility } from 'twenty-shared/types';

import { DashboardPresetEntity } from 'src/engine/metadata-modules/dashboard-preset/entities/dashboard-preset.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';

describe.skip('Dashboard preset acceptance boundary', () => {
  let pageLayoutId: string;
  let workspaceId: string;
  let applicationId: string;
  let createdDashboardPresetIds: string[] = [];

  beforeAll(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Dashboard Preset Acceptance Layout',
      },
    });

    pageLayoutId = data.createPageLayout.id;

    const pageLayout = await global.testDataSource
      .getRepository(PageLayoutEntity)
      .findOneOrFail({ where: { id: pageLayoutId } });

    workspaceId = pageLayout.workspaceId;
    applicationId = pageLayout.applicationId;
  });

  afterEach(async () => {
    if (createdDashboardPresetIds.length === 0) {
      return;
    }

    await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .delete(createdDashboardPresetIds);
    createdDashboardPresetIds = [];
  });

  afterAll(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

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

  it('should rename a dashboard preset while preserving id, filter, and creator metadata', async () => {
    const pageLayout = await global.testDataSource
      .getRepository(PageLayoutEntity)
      .findOneOrFail({ where: { id: pageLayoutId } });
    const initialFilter = {
      recordFilters: [
        {
          fieldMetadataId: randomUUID(),
          operand: 'eq',
          value: 'qualified',
          type: 'TEXT',
          recordFilterGroupId: null,
          subFieldName: null,
        },
      ],
      recordFilterGroups: [],
    };
    const seededPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .save({
        pageLayoutId,
        name: 'Q4 Pipeline',
        filter: initialFilter,
        creatorId: randomUUID(),
        visibility: ViewVisibility.WORKSPACE,
        workspaceId: pageLayout.workspaceId,
        applicationId: pageLayout.applicationId,
        universalIdentifier: randomUUID(),
      });

    createdDashboardPresetIds.push(seededPreset.id);

    const response = await request(global.app.getHttpServer())
      .post('/metadata')
      .send({
        query: `
          mutation RenameDashboardPreset($id: UUID!, $name: String!) {
            renameDashboardPreset(id: $id, name: $name) {
              id
              name
              visibility
              position
              filter {
                recordFilters {
                  fieldMetadataId
                  operand
                  value
                  type
                  recordFilterGroupId
                  subFieldName
                }
                recordFilterGroups {
                  id
                  logicalOperator
                  parentRecordFilterGroupId
                }
              }
              createdBy {
                id
                name
              }
            }
          }
        `,
        variables: {
          id: seededPreset.id,
          name: 'Q4 Deals',
        },
      });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.renameDashboardPreset).toMatchObject({
      id: seededPreset.id,
      name: 'Q4 Deals',
      filter: initialFilter,
      createdBy: {
        id: seededPreset.creatorId,
      },
    });

    const reloadedPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .findOneOrFail({
        where: { id: seededPreset.id },
      });

    expect(reloadedPreset.id).toBe(seededPreset.id);
    expect(reloadedPreset.name).toBe('Q4 Deals');
    expect(reloadedPreset.filter).toEqual(initialFilter);
    expect(reloadedPreset.creatorId).toBe(seededPreset.creatorId);
  });

  it('should replace a dashboard preset filter payload through the metadata API', async () => {
    const pageLayout = await global.testDataSource
      .getRepository(PageLayoutEntity)
      .findOneOrFail({ where: { id: pageLayoutId } });
    const seededPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .save({
        pageLayoutId,
        name: 'Pipeline Snapshot',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: randomUUID(),
              operand: 'eq',
              value: 'open',
              type: 'TEXT',
              recordFilterGroupId: null,
              subFieldName: null,
            },
          ],
          recordFilterGroups: [],
        },
        creatorId: randomUUID(),
        visibility: ViewVisibility.WORKSPACE,
        workspaceId: pageLayout.workspaceId,
        applicationId: pageLayout.applicationId,
        universalIdentifier: randomUUID(),
      });

    createdDashboardPresetIds.push(seededPreset.id);

    const replacementFilter = {
      recordFilters: [
        {
          fieldMetadataId: randomUUID(),
          operand: 'eq',
          value: 'closed-won',
          type: 'TEXT',
          recordFilterGroupId: null,
          subFieldName: null,
        },
      ],
      recordFilterGroups: [],
    };

    const response = await request(global.app.getHttpServer())
      .post('/metadata')
      .send({
        query: `
          mutation UpdateDashboardPresetFilters(
            $id: UUID!
            $filter: DashboardFilterInput!
          ) {
            updateDashboardPresetFilters(id: $id, filter: $filter) {
              id
              name
              filter {
                recordFilters {
                  fieldMetadataId
                  operand
                  value
                  type
                  recordFilterGroupId
                  subFieldName
                }
                recordFilterGroups {
                  id
                  logicalOperator
                  parentRecordFilterGroupId
                }
              }
            }
          }
        `,
        variables: {
          id: seededPreset.id,
          filter: replacementFilter,
        },
      });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateDashboardPresetFilters).toMatchObject({
      id: seededPreset.id,
      name: 'Pipeline Snapshot',
      filter: replacementFilter,
    });

    const reloadedPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .findOneOrFail({
        where: { id: seededPreset.id },
      });

    expect(reloadedPreset.filter).toEqual(replacementFilter);
    expect(reloadedPreset.name).toBe('Pipeline Snapshot');
  });

  it('should soft-delete a dashboard preset and exclude it from active reads while retaining recoverability', async () => {
    const pageLayout = await global.testDataSource
      .getRepository(PageLayoutEntity)
      .findOneOrFail({ where: { id: pageLayoutId } });
    const seededPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .save({
        pageLayoutId,
        name: 'Stale Pipeline',
        filter: {
          recordFilters: [],
          recordFilterGroups: [],
        },
        creatorId: randomUUID(),
        visibility: ViewVisibility.WORKSPACE,
        workspaceId: pageLayout.workspaceId,
        applicationId: pageLayout.applicationId,
        universalIdentifier: randomUUID(),
      });

    createdDashboardPresetIds.push(seededPreset.id);

    const response = await request(global.app.getHttpServer())
      .post('/metadata')
      .send({
        query: `
          mutation DeleteDashboardPreset($id: UUID!) {
            deleteDashboardPreset(id: $id) {
              id
              name
            }
          }
        `,
        variables: {
          id: seededPreset.id,
        },
      });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteDashboardPreset).toMatchObject({
      id: seededPreset.id,
      name: 'Stale Pipeline',
    });

    const activePreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .findOne({
        where: { id: seededPreset.id },
      });
    const deletedPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .findOne({
        where: { id: seededPreset.id },
        withDeleted: true,
      });

    expect(activePreset).toBeNull();
    expect(deletedPreset?.deletedAt).toEqual(expect.any(Date));
    expect(deletedPreset?.id).toBe(seededPreset.id);
  });

  it('should list WORKSPACE presets to another workspace member', async () => {
    const creatorId = '00000000-0000-0000-0000-0000000000a1';

    const seededPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .save({
        pageLayoutId,
        name: 'Shared pipeline preset',
        filter: {
          recordFilters: [],
          recordFilterGroups: [],
        },
        creatorId,
        visibility: ViewVisibility.WORKSPACE,
        workspaceId,
        applicationId,
        universalIdentifier: randomUUID(),
      });

    createdDashboardPresetIds.push(seededPreset.id);

    const response = await request(global.app.getHttpServer())
      .post('/metadata')
      .send({
        query: `
          query DashboardPresets($pageLayoutId: UUID!, $userId: UUID!) {
            dashboardPresets(pageLayoutId: $pageLayoutId, userId: $userId) {
              id
              name
              visibility
              createdBy {
                id
              }
            }
          }
        `,
        variables: {
          pageLayoutId,
          userId: '00000000-0000-0000-0000-0000000000b2',
        },
      });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.dashboardPresets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: seededPreset.id,
          name: 'Shared pipeline preset',
          visibility: ViewVisibility.WORKSPACE,
          createdBy: {
            id: creatorId,
          },
        }),
      ]),
    );
  });

  it('should hide UNLISTED presets from other workspace members', async () => {
    const seededPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .save({
        pageLayoutId,
        name: 'Private pipeline preset',
        filter: {
          recordFilters: [],
          recordFilterGroups: [],
        },
        creatorId: '00000000-0000-0000-0000-0000000000a1',
        visibility: ViewVisibility.UNLISTED,
        workspaceId,
        applicationId,
        universalIdentifier: randomUUID(),
      });

    createdDashboardPresetIds.push(seededPreset.id);

    const response = await request(global.app.getHttpServer())
      .post('/metadata')
      .send({
        query: `
          query DashboardPresets($pageLayoutId: UUID!, $userId: UUID!) {
            dashboardPresets(pageLayoutId: $pageLayoutId, userId: $userId) {
              id
              name
              visibility
            }
          }
        `,
        variables: {
          pageLayoutId,
          userId: '00000000-0000-0000-0000-0000000000b2',
        },
      });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.dashboardPresets.map(
        (dashboardPreset: { id: string }) => dashboardPreset.id,
      ),
    ).not.toContain(seededPreset.id);
  });

  it('should list a creator own UNLISTED presets', async () => {
    const creatorId = '00000000-0000-0000-0000-0000000000a1';
    const seededPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .save({
        pageLayoutId,
        name: 'My private pipeline preset',
        filter: {
          recordFilters: [],
          recordFilterGroups: [],
        },
        creatorId,
        visibility: ViewVisibility.UNLISTED,
        workspaceId,
        applicationId,
        universalIdentifier: randomUUID(),
      });

    createdDashboardPresetIds.push(seededPreset.id);

    const response = await request(global.app.getHttpServer())
      .post('/metadata')
      .send({
        query: `
          query DashboardPresets($pageLayoutId: UUID!, $userId: UUID!) {
            dashboardPresets(pageLayoutId: $pageLayoutId, userId: $userId) {
              id
              name
              visibility
            }
          }
        `,
        variables: {
          pageLayoutId,
          userId: creatorId,
        },
      });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.dashboardPresets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: seededPreset.id,
          name: 'My private pipeline preset',
          visibility: ViewVisibility.UNLISTED,
        }),
      ]),
    );
  });
});
