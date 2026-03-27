import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

describe('Dashboard preset service persistence', () => {
  let pageLayoutService: PageLayoutService;
  let pageLayoutUpdateService: PageLayoutUpdateService;
  let flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;
  let createdPageLayoutIds: string[] = [];

  beforeAll(() => {
    pageLayoutService = global.app.get(PageLayoutService);
    pageLayoutUpdateService = global.app.get(PageLayoutUpdateService);
    flatEntityMapsCacheService = global.app.get(
      WorkspaceManyOrAllFlatEntityMapsCacheService,
    );
  });

  afterEach(async () => {
    for (const pageLayoutId of createdPageLayoutIds) {
      await pageLayoutService.destroy({
        id: pageLayoutId,
        workspaceId: WORKSPACE_ID,
      });
    }

    createdPageLayoutIds = [];
    await flatEntityMapsCacheService.flushFlatEntityMaps({
      workspaceId: WORKSPACE_ID,
      flatMapsKeys: ['flatPageLayoutMaps'],
    });
  });

  const createDashboardPageLayout = async () => {
    const pageLayout = await pageLayoutService.create({
      workspaceId: WORKSPACE_ID,
      createPageLayoutInput: {
        name: 'Pipeline dashboard',
        type: PageLayoutType.DASHBOARD,
      },
    });

    createdPageLayoutIds.push(pageLayout.id);

    return pageLayout.id;
  };

  it('should create a dashboard preset and reload it from persisted metadata', async () => {
    const pageLayoutId = await createDashboardPageLayout();

    const createdPreset = await pageLayoutUpdateService.createPreset({
      workspaceId: WORKSPACE_ID,
      input: {
        pageLayoutId,
        name: 'Open pipeline',
        filterState: {
          stage: {
            eq: 'OPEN',
          },
        },
      },
    });

    await flatEntityMapsCacheService.flushFlatEntityMaps({
      workspaceId: WORKSPACE_ID,
      flatMapsKeys: ['flatPageLayoutMaps'],
    });

    const reloadedPreset = await pageLayoutService.getPresetById({
      workspaceId: WORKSPACE_ID,
      pageLayoutId,
      presetId: createdPreset.id,
    });

    expect(reloadedPreset).toEqual({
      id: createdPreset.id,
      name: 'Open pipeline',
      filterState: {
        stage: {
          eq: 'OPEN',
        },
      },
    });
  });

  it('should rename a dashboard preset and reflect the new name on reload', async () => {
    const pageLayoutId = await createDashboardPageLayout();
    const createdPreset = await pageLayoutUpdateService.createPreset({
      workspaceId: WORKSPACE_ID,
      input: {
        pageLayoutId,
        name: 'Open pipeline',
        filterState: {
          owner: {
            eq: 'apple-jane',
          },
        },
      },
    });

    const renamedPreset = await pageLayoutUpdateService.renamePreset({
      workspaceId: WORKSPACE_ID,
      input: {
        presetId: createdPreset.id,
        newName: 'Q1 pipeline',
      },
    });

    await flatEntityMapsCacheService.flushFlatEntityMaps({
      workspaceId: WORKSPACE_ID,
      flatMapsKeys: ['flatPageLayoutMaps'],
    });

    const reloadedPreset = await pageLayoutService.getPresetById({
      workspaceId: WORKSPACE_ID,
      pageLayoutId,
      presetId: createdPreset.id,
    });

    expect(renamedPreset.name).toBe('Q1 pipeline');
    expect(reloadedPreset).toEqual({
      id: createdPreset.id,
      name: 'Q1 pipeline',
      filterState: {
        owner: {
          eq: 'apple-jane',
        },
      },
    });
  });

  it('should keep dashboard presets accessible after a page-layout migration and flat-map reconstruction', async () => {
    const pageLayoutId = await createDashboardPageLayout();
    const createdPreset = await pageLayoutUpdateService.createPreset({
      workspaceId: WORKSPACE_ID,
      input: {
        pageLayoutId,
        name: 'Weighted pipeline',
        filterState: {
          probability: {
            gte: 70,
          },
        },
      },
    });

    await pageLayoutService.update({
      id: pageLayoutId,
      workspaceId: WORKSPACE_ID,
      updateData: {
        name: 'Pipeline dashboard v2',
      },
    });

    await flatEntityMapsCacheService.flushFlatEntityMaps({
      workspaceId: WORKSPACE_ID,
      flatMapsKeys: ['flatPageLayoutMaps'],
    });

    const reloadedPreset = await pageLayoutService.getPresetById({
      workspaceId: WORKSPACE_ID,
      pageLayoutId,
      presetId: createdPreset.id,
    });

    expect(reloadedPreset).toEqual({
      id: createdPreset.id,
      name: 'Weighted pipeline',
      filterState: {
        probability: {
          gte: 70,
        },
      },
    });
  });
});
