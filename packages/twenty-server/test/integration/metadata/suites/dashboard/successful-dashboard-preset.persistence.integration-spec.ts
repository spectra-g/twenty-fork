import { randomUUID } from 'crypto';

import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { ViewVisibility } from 'twenty-shared/types';

import { DashboardPresetEntity } from 'src/engine/metadata-modules/dashboard-preset/entities/dashboard-preset.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';

describe('Dashboard preset persistence', () => {
  let pageLayoutId: string;
  let createdDashboardPresetIds: string[] = [];

  beforeAll(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Dashboard Preset Page Layout' },
    });

    pageLayoutId = data.createPageLayout.id;
  });

  afterEach(async () => {
    if (createdDashboardPresetIds.length === 0) {
      return;
    }

    const dashboardPresetRepository =
      global.testDataSource.getRepository(DashboardPresetEntity);

    await dashboardPresetRepository.delete(createdDashboardPresetIds);
    createdDashboardPresetIds = [];
  });

  afterAll(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

  it('should persist a workspace dashboard preset with generated id', async () => {
    const pageLayoutRepository =
      global.testDataSource.getRepository(PageLayoutEntity);
    const dashboardPresetRepository =
      global.testDataSource.getRepository(DashboardPresetEntity);

    const pageLayout = await pageLayoutRepository.findOneOrFail({
      where: { id: pageLayoutId },
    });
    const filter = {
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

    const savedDashboardPreset = await dashboardPresetRepository.save(
      dashboardPresetRepository.create({
        pageLayoutId,
        name: 'Q4 Pipeline',
        filter,
        creatorId: randomUUID(),
        visibility: ViewVisibility.WORKSPACE,
        workspaceId: pageLayout.workspaceId,
        applicationId: pageLayout.applicationId,
        universalIdentifier: randomUUID(),
      }),
    );

    createdDashboardPresetIds.push(savedDashboardPreset.id);

    const reloadedDashboardPreset = await dashboardPresetRepository.findOneOrFail(
      {
        where: { id: savedDashboardPreset.id },
      },
    );

    expect(reloadedDashboardPreset).toMatchObject({
      id: expect.any(String),
      pageLayoutId,
      name: 'Q4 Pipeline',
      filter,
      creatorId: savedDashboardPreset.creatorId,
      visibility: ViewVisibility.WORKSPACE,
      deletedAt: null,
    });
  });

  it('should persist unlisted visibility and deletedAt values', async () => {
    const pageLayoutRepository =
      global.testDataSource.getRepository(PageLayoutEntity);
    const dashboardPresetRepository =
      global.testDataSource.getRepository(DashboardPresetEntity);

    const pageLayout = await pageLayoutRepository.findOneOrFail({
      where: { id: pageLayoutId },
    });
    const deletedAt = new Date('2025-01-15T12:00:00.000Z');

    const savedDashboardPreset = await dashboardPresetRepository.save(
      dashboardPresetRepository.create({
        pageLayoutId,
        name: 'Private Draft',
        filter: {
          recordFilters: [],
          recordFilterGroups: [],
        },
        creatorId: randomUUID(),
        visibility: ViewVisibility.UNLISTED,
        deletedAt,
        workspaceId: pageLayout.workspaceId,
        applicationId: pageLayout.applicationId,
        universalIdentifier: randomUUID(),
      }),
    );

    createdDashboardPresetIds.push(savedDashboardPreset.id);

    const reloadedDashboardPreset = await dashboardPresetRepository.findOneOrFail(
      {
        where: { id: savedDashboardPreset.id },
        withDeleted: true,
      },
    );

    expect(reloadedDashboardPreset.visibility).toBe(ViewVisibility.UNLISTED);
    expect(reloadedDashboardPreset.deletedAt).toEqual(deletedAt);
    expect(reloadedDashboardPreset.filter).toEqual({
      recordFilters: [],
      recordFilterGroups: [],
    });
  });
});
