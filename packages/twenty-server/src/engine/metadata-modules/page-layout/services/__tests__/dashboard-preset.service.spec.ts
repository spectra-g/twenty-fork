import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { PageLayoutException } from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const PAGE_LAYOUT_ID = 'page-layout-id';
const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER = 'page-layout-universal-identifier';

const buildFlatPageLayout = (
  overrides: Partial<FlatPageLayout> = {},
): FlatPageLayout => ({
  id: PAGE_LAYOUT_ID,
  name: 'Pipeline Dashboard',
  type: PageLayoutType.DASHBOARD,
  objectMetadataId: null,
  defaultTabToFocusOnMobileAndSidePanelId: null,
  createdAt: '2026-03-27T12:00:00.000Z',
  updatedAt: '2026-03-27T12:00:00.000Z',
  deletedAt: null,
  workspaceId: WORKSPACE_ID,
  universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  applicationId: APPLICATION_ID,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: null,
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
  tabIds: [],
  tabUniversalIdentifiers: [],
  ...overrides,
});

describe('Dashboard preset service logic', () => {
  const dashboardSyncService = {
    updateLinkedDashboardsUpdatedAtByPageLayoutId: jest.fn(),
  };

  const applicationService = {
    findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
      .fn()
      .mockResolvedValue({
        workspaceCustomFlatApplication: {
          id: APPLICATION_ID,
          universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      }),
  };

  let currentFlatPageLayout = buildFlatPageLayout();

  const workspaceManyOrAllFlatEntityMapsCacheService = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(async ({ flatMapsKeys }) => {
      if (flatMapsKeys.includes('flatObjectMetadataMaps')) {
        return {
          flatPageLayoutMaps: {
            byUniversalIdentifier: {
              [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER]: currentFlatPageLayout,
            },
            universalIdentifierById: {
              [PAGE_LAYOUT_ID]: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
            },
            universalIdentifiersByApplicationId: {
              [APPLICATION_ID]: [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER],
            },
          },
          flatObjectMetadataMaps: {
            byUniversalIdentifier: {},
            universalIdentifierById: {},
            universalIdentifiersByApplicationId: {},
          },
        };
      }

      return {
        flatPageLayoutMaps: {
          byUniversalIdentifier: {
            [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER]: currentFlatPageLayout,
          },
          universalIdentifierById: {
            [PAGE_LAYOUT_ID]: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          },
          universalIdentifiersByApplicationId: {
            [APPLICATION_ID]: [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER],
          },
        },
        flatPageLayoutTabMaps: {
          byUniversalIdentifier: {},
          universalIdentifierById: {},
          universalIdentifiersByApplicationId: {},
        },
        flatPageLayoutWidgetMaps: {
          byUniversalIdentifier: {},
          universalIdentifierById: {},
          universalIdentifiersByApplicationId: {},
        },
      };
    }),
  };

  const workspaceMigrationValidateBuildAndRunService = {
    validateBuildAndRunWorkspaceMigration: jest.fn(
      async ({ allFlatEntityOperationByMetadataName }) => {
        const [updatedFlatPageLayout] =
          allFlatEntityOperationByMetadataName.pageLayout.flatEntityToUpdate;

        if (updatedFlatPageLayout) {
          currentFlatPageLayout = updatedFlatPageLayout;
        }

        return { status: 'success' };
      },
    ),
  };

  let pageLayoutService: PageLayoutService;
  let pageLayoutUpdateService: PageLayoutUpdateService;

  beforeEach(() => {
    jest.clearAllMocks();
    currentFlatPageLayout = buildFlatPageLayout();

    pageLayoutService = new PageLayoutService(
      {} as never,
      workspaceMigrationValidateBuildAndRunService as never,
      workspaceManyOrAllFlatEntityMapsCacheService as never,
      applicationService as never,
      dashboardSyncService as never,
    );

    pageLayoutUpdateService = new PageLayoutUpdateService(
      workspaceMigrationValidateBuildAndRunService as never,
      workspaceManyOrAllFlatEntityMapsCacheService as never,
      applicationService as never,
      dashboardSyncService as never,
    );
  });

  it('should create a dashboard preset and reload it from the updated page-layout metadata', async () => {
    const createdPreset = await pageLayoutUpdateService.createPreset({
      workspaceId: WORKSPACE_ID,
      input: {
        pageLayoutId: PAGE_LAYOUT_ID,
        name: 'Open pipeline',
        filterState: {
          stage: {
            eq: 'OPEN',
          },
        },
      },
    });

    const reloadedPreset = await pageLayoutService.getPresetById({
      workspaceId: WORKSPACE_ID,
      pageLayoutId: PAGE_LAYOUT_ID,
      presetId: createdPreset.id,
    });

    expect(createdPreset).toEqual({
      id: expect.any(String),
      name: 'Open pipeline',
      filterState: {
        stage: {
          eq: 'OPEN',
        },
      },
    });
    expect(reloadedPreset).toEqual(createdPreset);
  });

  it('should rename a dashboard preset without losing its filter state', async () => {
    const createdPreset = await pageLayoutUpdateService.createPreset({
      workspaceId: WORKSPACE_ID,
      input: {
        pageLayoutId: PAGE_LAYOUT_ID,
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

    const reloadedPreset = await pageLayoutService.getPresetById({
      workspaceId: WORKSPACE_ID,
      pageLayoutId: PAGE_LAYOUT_ID,
      presetId: createdPreset.id,
    });

    expect(renamedPreset).toEqual({
      id: createdPreset.id,
      name: 'Q1 pipeline',
      filterState: {
        owner: {
          eq: 'apple-jane',
        },
      },
    });
    expect(reloadedPreset).toEqual(renamedPreset);
  });

  it('should keep dashboard presets when a page-layout update runs through workspace migration', async () => {
    const createdPreset = await pageLayoutUpdateService.createPreset({
      workspaceId: WORKSPACE_ID,
      input: {
        pageLayoutId: PAGE_LAYOUT_ID,
        name: 'Weighted pipeline',
        filterState: {
          probability: {
            gte: 70,
          },
        },
      },
    });

    await pageLayoutService.update({
      id: PAGE_LAYOUT_ID,
      workspaceId: WORKSPACE_ID,
      updateData: {
        name: 'Pipeline Dashboard v2',
      },
    });

    const reloadedPreset = await pageLayoutService.getPresetById({
      workspaceId: WORKSPACE_ID,
      pageLayoutId: PAGE_LAYOUT_ID,
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
    expect(currentFlatPageLayout.name).toBe('Pipeline Dashboard v2');
  });

  it('should reject creating a preset when another preset on the same dashboard already has the same name', async () => {
    await pageLayoutUpdateService.createPreset({
      workspaceId: WORKSPACE_ID,
      input: {
        pageLayoutId: PAGE_LAYOUT_ID,
        name: 'Sales',
        filterState: {
          stage: {
            eq: 'OPEN',
          },
        },
      },
    });

    await expect(
      pageLayoutUpdateService.createPreset({
        workspaceId: WORKSPACE_ID,
        input: {
          pageLayoutId: PAGE_LAYOUT_ID,
          name: 'Sales',
          filterState: {
            stage: {
              eq: 'CLOSED_WON',
            },
          },
        },
      }),
    ).rejects.toThrow(PageLayoutException);
  });

  it('should reject renaming a preset when the new name already exists on the same dashboard', async () => {
    const firstPreset = await pageLayoutUpdateService.createPreset({
      workspaceId: WORKSPACE_ID,
      input: {
        pageLayoutId: PAGE_LAYOUT_ID,
        name: 'Sales',
        filterState: {
          stage: {
            eq: 'OPEN',
          },
        },
      },
    });

    const secondPreset = await pageLayoutUpdateService.createPreset({
      workspaceId: WORKSPACE_ID,
      input: {
        pageLayoutId: PAGE_LAYOUT_ID,
        name: 'Marketing',
        filterState: {
          stage: {
            eq: 'CLOSED_WON',
          },
        },
      },
    });

    expect(firstPreset.name).toBe('Sales');

    await expect(
      pageLayoutUpdateService.renamePreset({
        workspaceId: WORKSPACE_ID,
        input: {
          presetId: secondPreset.id,
          newName: 'Sales',
        },
      }),
    ).rejects.toThrow(PageLayoutException);
  });
});
