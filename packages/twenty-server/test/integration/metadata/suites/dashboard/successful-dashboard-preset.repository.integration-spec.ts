import { randomUUID } from 'crypto';

import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { ViewVisibility } from 'twenty-shared/types';

import { DashboardPresetEntity } from 'src/engine/metadata-modules/dashboard-preset/entities/dashboard-preset.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { DashboardPresetRepository } from 'src/modules/dashboard/repositories/dashboard-preset.repository';

describe('DashboardPresetRepository', () => {
  let pageLayoutId: string;
  let workspaceId: string;
  let applicationId: string;
  let dashboardPresetRepository: DashboardPresetRepository;
  let createdDashboardPresetIds: string[] = [];

  beforeAll(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Dashboard Preset Repository Layout',
      },
    });

    pageLayoutId = data.createPageLayout.id;

    const pageLayout = await global.testDataSource
      .getRepository(PageLayoutEntity)
      .findOneOrFail({
        where: { id: pageLayoutId },
      });

    workspaceId = pageLayout.workspaceId;
    applicationId = pageLayout.applicationId;

    dashboardPresetRepository = new DashboardPresetRepository(
      global.testDataSource.getRepository(DashboardPresetEntity),
    );
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

  const createDashboardPreset = async ({
    name,
    filter,
  }: {
    name: string;
    filter: Record<string, unknown>;
  }) => {
    const dashboardPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .save({
        pageLayoutId,
        name,
        filter,
        creatorId: randomUUID(),
        visibility: ViewVisibility.WORKSPACE,
        workspaceId,
        applicationId,
        universalIdentifier: randomUUID(),
      });

    createdDashboardPresetIds.push(dashboardPreset.id);

    return dashboardPreset;
  };

  it('renames a preset while preserving id, creatorId, and filter payload', async () => {
    const originalFilter = {
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
    const preset = await createDashboardPreset({
      name: 'Q4 Pipeline',
      filter: originalFilter,
    });

    await dashboardPresetRepository.rename({
      id: preset.id,
      name: 'Q4 Deals',
    });

    const reloadedPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .findOneOrFail({
        where: { id: preset.id },
      });

    expect(reloadedPreset.name).toBe('Q4 Deals');
    expect(reloadedPreset.id).toBe(preset.id);
    expect(reloadedPreset.creatorId).toBe(preset.creatorId);
    expect(reloadedPreset.filter).toEqual(originalFilter);
  });

  it('replaces a preset filter payload without changing the name', async () => {
    const preset = await createDashboardPreset({
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
    });
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

    await dashboardPresetRepository.updateFilters({
      id: preset.id,
      filter: replacementFilter,
    });

    const reloadedPreset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .findOneOrFail({
        where: { id: preset.id },
      });

    expect(reloadedPreset.filter).toEqual(replacementFilter);
    expect(reloadedPreset.name).toBe('Pipeline Snapshot');
  });

  it('soft-deletes a preset and excludes it from active reads while keeping it queryable with deleted records included', async () => {
    const preset = await createDashboardPreset({
      name: 'Stale Pipeline',
      filter: {
        recordFilters: [],
        recordFilterGroups: [],
      },
    });

    await dashboardPresetRepository.softDelete({ id: preset.id });

    const activePresets = await dashboardPresetRepository.findActiveByPageLayoutId(
      {
        pageLayoutId,
      },
    );
    const allPresets =
      await dashboardPresetRepository.findByPageLayoutIdIncludingDeleted({
        pageLayoutId,
      });

    expect(activePresets.map(({ id }) => id)).not.toContain(preset.id);
    expect(allPresets.map(({ id }) => id)).toContain(preset.id);

    const softDeletedPreset = allPresets.find(({ id }) => id === preset.id);

    expect(softDeletedPreset?.deletedAt).toEqual(expect.any(Date));
    expect(softDeletedPreset?.name).toBe('Stale Pipeline');
  });

  it('lists WORKSPACE presets to another workspace member', async () => {
    const preset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .save({
        pageLayoutId,
        name: 'Shared preset',
        filter: {
          recordFilters: [],
          recordFilterGroups: [],
        },
        creatorId: '00000000-0000-0000-0000-0000000000a1',
        visibility: ViewVisibility.WORKSPACE,
        workspaceId,
        applicationId,
        universalIdentifier: randomUUID(),
      });

    createdDashboardPresetIds.push(preset.id);

    const presets = await dashboardPresetRepository.findAvailablePresets({
      workspaceId,
      userId: '00000000-0000-0000-0000-0000000000b2',
    });

    expect(presets.map(({ id }) => id)).toContain(preset.id);
  });

  it('does not list UNLISTED presets to another workspace member', async () => {
    const preset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .save({
        pageLayoutId,
        name: 'Private preset',
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

    createdDashboardPresetIds.push(preset.id);

    const presets = await dashboardPresetRepository.findAvailablePresets({
      workspaceId,
      userId: '00000000-0000-0000-0000-0000000000b2',
    });

    expect(presets.map(({ id }) => id)).not.toContain(preset.id);
  });

  it('lists a creator own UNLISTED presets', async () => {
    const creatorId = '00000000-0000-0000-0000-0000000000a1';
    const preset = await global.testDataSource
      .getRepository(DashboardPresetEntity)
      .save({
        pageLayoutId,
        name: 'My private preset',
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

    createdDashboardPresetIds.push(preset.id);

    const presets = await dashboardPresetRepository.findAvailablePresets({
      workspaceId,
      userId: creatorId,
    });

    expect(presets.map(({ id }) => id)).toContain(preset.id);
  });
});
