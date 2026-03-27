import { Injectable } from '@nestjs/common';

import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { computeDiffBetweenObjects, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-tab/constants/flat-page-layout-tab-editable-properties.constant';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-widget/constants/flat-page-layout-widget-editable-properties.constant';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { reconstructFlatPageLayoutWithTabsAndWidgets } from 'src/engine/metadata-modules/flat-page-layout/utils/reconstruct-flat-page-layout-with-tabs-and-widgets.util';
import { type DashboardPresetDTO } from 'src/engine/metadata-modules/page-layout/dtos/dashboard-preset.dto';
import { type CreateDashboardPresetInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-dashboard-preset.input';
import { type RenameDashboardPresetInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/rename-dashboard-preset.input';
import { UpdatePageLayoutTabWithWidgetsInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/update-page-layout-tab-with-widgets.input';
import { UpdatePageLayoutWidgetWithIdInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget-with-id.input';
import { UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import { PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto } from 'src/engine/metadata-modules/page-layout/utils/from-flat-page-layout-with-tabs-and-widgets-to-page-layout-dto.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { DashboardSyncService } from 'src/modules/dashboard-sync/services/dashboard-sync.service';
import {
  assertDashboardPresetNameIsUniqueOrThrow,
  findDashboardPresetOrThrow,
} from 'src/engine/metadata-modules/page-layout/utils/dashboard-preset.util';

type UpdatePageLayoutWithTabsParams = {
  id: string;
  workspaceId: string;
  input: UpdatePageLayoutWithTabsInput;
};

@Injectable()
export class PageLayoutUpdateService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly dashboardSyncService: DashboardSyncService,
  ) {}

  async createPreset({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateDashboardPresetInput;
  }): Promise<DashboardPresetDTO> {
    const { flatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const existingPageLayout = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: input.pageLayoutId,
      flatEntityMaps: flatPageLayoutMaps,
    });

    if (
      !isDefined(existingPageLayout) ||
      isDefined(existingPageLayout.deletedAt)
    ) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          input.pageLayoutId,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    assertDashboardPresetNameIsUniqueOrThrow({
      flatPageLayout: existingPageLayout,
      presetName: input.name,
    });

    const createdPreset: DashboardPresetDTO = {
      id: v4(),
      name: input.name,
      filterState: input.filterState ?? {},
    };

    const flatPageLayoutToUpdate: FlatPageLayout = {
      ...existingPageLayout,
      dashboardPresets: [
        ...(existingPageLayout.dashboardPresets ?? []),
        createdPreset,
      ],
      updatedAt: new Date().toISOString(),
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating dashboard preset',
      );
    }

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByPageLayoutId(
      {
        pageLayoutId: input.pageLayoutId,
        workspaceId,
        updatedAt: new Date(flatPageLayoutToUpdate.updatedAt),
      },
    );

    return createdPreset;
  }

  async renamePreset({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: RenameDashboardPresetInput;
  }): Promise<DashboardPresetDTO> {
    const { flatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const existingPageLayout = Object.values(
      flatPageLayoutMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (flatPageLayout) =>
          !isDefined(flatPageLayout.deletedAt) &&
          (flatPageLayout.dashboardPresets ?? []).some(
            (preset) => preset.id === input.presetId,
          ),
      );

    if (!isDefined(existingPageLayout)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.DASHBOARD_PRESET_NOT_FOUND,
          input.presetId,
        ),
        PageLayoutExceptionCode.DASHBOARD_PRESET_NOT_FOUND,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    assertDashboardPresetNameIsUniqueOrThrow({
      flatPageLayout: existingPageLayout,
      presetName: input.newName,
      excludedPresetId: input.presetId,
    });

    const flatPageLayoutToUpdate: FlatPageLayout = {
      ...existingPageLayout,
      dashboardPresets: (existingPageLayout.dashboardPresets ?? []).map(
        (preset) =>
          preset.id === input.presetId
            ? {
                ...preset,
                name: input.newName,
              }
            : preset,
      ),
      updatedAt: new Date().toISOString(),
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while renaming dashboard preset',
      );
    }

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByPageLayoutId(
      {
        pageLayoutId: existingPageLayout.id,
        workspaceId,
        updatedAt: new Date(flatPageLayoutToUpdate.updatedAt),
      },
    );

    return findDashboardPresetOrThrow({
      flatPageLayout: flatPageLayoutToUpdate,
      presetId: input.presetId,
    });
  }

  async updatePageLayoutWithTabs({
    id,
    workspaceId,
    input,
  }: UpdatePageLayoutWithTabsParams): Promise<PageLayoutDTO> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatPageLayoutMaps',
            'flatPageLayoutTabMaps',
            'flatPageLayoutWidgetMaps',
          ],
        },
      );

    const existingPageLayout = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatPageLayoutMaps,
    });

    // TODO move in validator
    if (
      !isDefined(existingPageLayout) ||
      isDefined(existingPageLayout.deletedAt)
    ) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          id,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }
    ///

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { tabs, ...updateData } = input;

    const flatPageLayoutToUpdate: FlatPageLayout = {
      ...existingPageLayout,
      name: updateData.name,
      type: updateData.type,
      objectMetadataId: updateData.objectMetadataId,
      updatedAt: new Date().toISOString(),
    };

    const { tabsToCreate, tabsToUpdate, tabsToDelete } =
      this.computeTabOperations({
        existingPageLayout,
        tabs,
        flatPageLayoutTabMaps,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      });

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatFrontComponentMaps,
      flatViewFieldGroupMaps,
      flatViewMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatFrontComponentMaps',
            'flatViewFieldGroupMaps',
            'flatViewMaps',
          ],
        },
      );

    const optimisticFlatPageLayoutTabMaps = tabsToCreate.reduce(
      (maps, tab) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: tab,
          flatEntityMaps: maps,
        }),
      flatPageLayoutTabMaps,
    );

    const { widgetsToCreate, widgetsToUpdate, widgetsToDelete } =
      this.computeWidgetOperationsForAllTabs({
        tabs,
        flatPageLayoutWidgetMaps,
        flatPageLayoutTabMaps: optimisticFlatPageLayoutTabMaps,
        flatObjectMetadataMaps,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatFieldMetadataMaps,
        flatFrontComponentMaps,
        flatViewFieldGroupMaps,
        flatViewMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutToUpdate],
            },
            pageLayoutTab: {
              flatEntityToCreate: tabsToCreate,
              flatEntityToDelete: tabsToDelete,
              flatEntityToUpdate: tabsToUpdate,
            },
            pageLayoutWidget: {
              flatEntityToCreate: widgetsToCreate,
              flatEntityToDelete: widgetsToDelete,
              flatEntityToUpdate: widgetsToUpdate,
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating page layout with tabs',
      );
    }

    const {
      flatPageLayoutMaps: recomputedFlatPageLayoutMaps,
      flatPageLayoutTabMaps: recomputedFlatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps: recomputedFlatPageLayoutWidgetMaps,
    } = await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatPageLayoutMaps',
          'flatPageLayoutTabMaps',
          'flatPageLayoutWidgetMaps',
        ],
      },
    );

    const flatLayout = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedFlatPageLayoutMaps,
    });

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByPageLayoutId(
      {
        pageLayoutId: id,
        workspaceId,
        updatedAt: new Date(flatLayout.updatedAt),
      },
    );

    return fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto(
      reconstructFlatPageLayoutWithTabsAndWidgets({
        layout: flatLayout,
        flatPageLayoutTabMaps: recomputedFlatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps: recomputedFlatPageLayoutWidgetMaps,
      }),
    );
  }

  private computeTabOperations({
    existingPageLayout,
    tabs,
    flatPageLayoutTabMaps,
    workspaceId,
    workspaceCustomApplicationId,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    existingPageLayout: FlatPageLayout;
    tabs: UpdatePageLayoutTabWithWidgetsInput[];
    flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
    workspaceId: string;
    workspaceCustomApplicationId: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  }): {
    tabsToCreate: FlatPageLayoutTab[];
    tabsToUpdate: FlatPageLayoutTab[];
    tabsToDelete: FlatPageLayoutTab[];
  } {
    const existingTabs = Object.values(
      flatPageLayoutTabMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((tab) => tab.pageLayoutId === existingPageLayout.id);

    const {
      toCreate: entitiesToCreate,
      toUpdate: entitiesToUpdate,
      toRestoreAndUpdate: entitiesToRestoreAndUpdate,
      idsToDelete,
    } = computeDiffBetweenObjects<
      FlatPageLayoutTab,
      UpdatePageLayoutTabWithWidgetsInput
    >({
      existingObjects: existingTabs,
      receivedObjects: tabs,
      propertiesToCompare: FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES,
    });

    const now = new Date();

    const tabsToCreate: FlatPageLayoutTab[] = entitiesToCreate.map(
      (tabInput) => {
        const tabId = tabInput.id ?? v4();

        return {
          id: tabId,
          title: tabInput.title,
          position: tabInput.position,
          pageLayoutId: existingPageLayout.id,
          pageLayoutUniversalIdentifier: existingPageLayout.universalIdentifier,
          workspaceId,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          deletedAt: null,
          universalIdentifier: tabId,
          applicationId: workspaceCustomApplicationId,
          applicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          widgetIds: [],
          widgetUniversalIdentifiers: [],
          icon: null,
          layoutMode: PageLayoutTabLayoutMode.GRID,
        };
      },
    );

    const tabsToUpdate: FlatPageLayoutTab[] = entitiesToUpdate.map(
      (tabInput) => {
        const existingTab = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: tabInput.id,
          flatEntityMaps: flatPageLayoutTabMaps,
        });

        return {
          ...existingTab,
          title: tabInput.title,
          position: tabInput.position,
          updatedAt: now.toISOString(),
        };
      },
    );

    const tabsToRestoreAndUpdate: FlatPageLayoutTab[] =
      entitiesToRestoreAndUpdate.map((tabInput) => {
        const existingTab = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: tabInput.id,
          flatEntityMaps: flatPageLayoutTabMaps,
        });

        return {
          ...existingTab,
          title: tabInput.title,
          position: tabInput.position,
          deletedAt: null,
          updatedAt: now.toISOString(),
        };
      });

    const tabsToDelete: FlatPageLayoutTab[] = idsToDelete
      .map((tabId) => {
        const existingTab = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: tabId,
          flatEntityMaps: flatPageLayoutTabMaps,
        });

        if (!isDefined(existingTab)) {
          return null;
        }

        return {
          ...existingTab,
          deletedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
      })
      .filter(isDefined);

    return {
      tabsToCreate,
      tabsToUpdate: [
        ...tabsToUpdate,
        ...tabsToRestoreAndUpdate,
        ...tabsToDelete,
      ],
      tabsToDelete: [],
    };
  }

  private computeWidgetOperationsForAllTabs({
    tabs,
    flatPageLayoutWidgetMaps,
    flatPageLayoutTabMaps,
    flatObjectMetadataMaps,
    workspaceId,
    workspaceCustomApplicationId,
    workspaceCustomApplicationUniversalIdentifier,
    flatFieldMetadataMaps,
    flatFrontComponentMaps,
    flatViewFieldGroupMaps,
    flatViewMaps,
  }: {
    tabs: UpdatePageLayoutTabWithWidgetsInput[];
    workspaceId: string;
    workspaceCustomApplicationId: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatFrontComponentMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatViewMaps'
    | 'flatPageLayoutTabMaps'
    | 'flatPageLayoutWidgetMaps'
  >): {
    widgetsToCreate: FlatPageLayoutWidget[];
    widgetsToUpdate: FlatPageLayoutWidget[];
    widgetsToDelete: FlatPageLayoutWidget[];
  } {
    const allWidgetsToCreate: FlatPageLayoutWidget[] = [];
    const allWidgetsToUpdate: FlatPageLayoutWidget[] = [];

    for (const tabInput of tabs) {
      const { widgetsToCreate, widgetsToUpdate } =
        this.computeWidgetOperationsForTab({
          tabId: tabInput.id,
          widgets: tabInput.widgets,
          flatPageLayoutWidgetMaps,
          flatPageLayoutTabMaps,
          flatObjectMetadataMaps,
          workspaceId,
          workspaceCustomApplicationId,
          workspaceCustomApplicationUniversalIdentifier,
          flatFieldMetadataMaps,
          flatFrontComponentMaps,
          flatViewFieldGroupMaps,
          flatViewMaps,
        });

      allWidgetsToCreate.push(...widgetsToCreate);
      allWidgetsToUpdate.push(...widgetsToUpdate);
    }

    return {
      widgetsToCreate: allWidgetsToCreate,
      widgetsToUpdate: allWidgetsToUpdate,
      widgetsToDelete: [],
    };
  }

  private computeWidgetOperationsForTab({
    tabId,
    widgets,
    flatPageLayoutWidgetMaps,
    flatPageLayoutTabMaps,
    flatObjectMetadataMaps,
    workspaceId,
    workspaceCustomApplicationId,
    workspaceCustomApplicationUniversalIdentifier,
    flatFieldMetadataMaps,
    flatFrontComponentMaps,
    flatViewFieldGroupMaps,
    flatViewMaps,
  }: {
    tabId: string;
    widgets: UpdatePageLayoutWidgetWithIdInput[];
    workspaceId: string;
    workspaceCustomApplicationId: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatFrontComponentMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatViewMaps'
    | 'flatPageLayoutTabMaps'
    | 'flatPageLayoutWidgetMaps'
  >): {
    widgetsToCreate: FlatPageLayoutWidget[];
    widgetsToUpdate: FlatPageLayoutWidget[];
  } {
    const existingWidgets = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((widget) => widget.pageLayoutTabId === tabId);

    const {
      toCreate: entitiesToCreate,
      toUpdate: entitiesToUpdate,
      toRestoreAndUpdate: entitiesToRestoreAndUpdate,
      idsToDelete,
    } = computeDiffBetweenObjects<
      FlatPageLayoutWidget,
      UpdatePageLayoutWidgetWithIdInput
    >({
      existingObjects: existingWidgets,
      receivedObjects: widgets,
      propertiesToCompare: FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES,
    });

    const now = new Date();
    const widgetsToCreate: FlatPageLayoutWidget[] = entitiesToCreate.map(
      (widgetInput) => {
        const widgetId = widgetInput.id ?? v4();

        const {
          pageLayoutTabUniversalIdentifier,
          objectMetadataUniversalIdentifier,
        } = resolveEntityRelationUniversalIdentifiers({
          metadataName: 'pageLayoutWidget',
          foreignKeyValues: {
            pageLayoutTabId: widgetInput.pageLayoutTabId,
            objectMetadataId: widgetInput.objectMetadataId,
          },
          flatEntityMaps: { flatPageLayoutTabMaps, flatObjectMetadataMaps },
        });

        return {
          id: widgetId,
          pageLayoutTabId: widgetInput.pageLayoutTabId,
          pageLayoutTabUniversalIdentifier,
          title: widgetInput.title,
          type: widgetInput.type,
          objectMetadataId: widgetInput.objectMetadataId ?? null,
          objectMetadataUniversalIdentifier,
          gridPosition: widgetInput.gridPosition,
          position: widgetInput.position ?? null,
          configuration: widgetInput.configuration,
          workspaceId,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          deletedAt: null,
          universalIdentifier: widgetId,
          applicationId: workspaceCustomApplicationId,
          applicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          conditionalDisplay: null,
          universalConfiguration:
            fromPageLayoutWidgetConfigurationToUniversalConfiguration({
              configuration: widgetInput.configuration,
              fieldMetadataUniversalIdentifierById:
                flatFieldMetadataMaps.universalIdentifierById,
              frontComponentUniversalIdentifierById:
                flatFrontComponentMaps.universalIdentifierById,
              viewFieldGroupUniversalIdentifierById:
                flatViewFieldGroupMaps.universalIdentifierById,
              viewUniversalIdentifierById: flatViewMaps.universalIdentifierById,
            }),
        };
      },
    );

    const widgetsToUpdate: FlatPageLayoutWidget[] = entitiesToUpdate.map(
      (widgetInput) => {
        const existingWidget = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: widgetInput.id,
          flatEntityMaps: flatPageLayoutWidgetMaps,
        });

        const updatedConfiguration = widgetInput.configuration ?? null;

        const {
          pageLayoutTabUniversalIdentifier,
          objectMetadataUniversalIdentifier,
        } = resolveEntityRelationUniversalIdentifiers({
          metadataName: 'pageLayoutWidget',
          foreignKeyValues: {
            pageLayoutTabId: widgetInput.pageLayoutTabId,
            objectMetadataId: widgetInput.objectMetadataId,
          },
          flatEntityMaps: { flatPageLayoutTabMaps, flatObjectMetadataMaps },
        });

        return {
          ...existingWidget,
          pageLayoutTabId: widgetInput.pageLayoutTabId,
          pageLayoutTabUniversalIdentifier,
          title: widgetInput.title,
          type: widgetInput.type,
          objectMetadataId: widgetInput.objectMetadataId ?? null,
          objectMetadataUniversalIdentifier,
          gridPosition: widgetInput.gridPosition,
          position: widgetInput.position ?? null,
          configuration: updatedConfiguration,
          updatedAt: now.toISOString(),
          ...(isDefined(updatedConfiguration) && {
            universalConfiguration:
              fromPageLayoutWidgetConfigurationToUniversalConfiguration({
                configuration: updatedConfiguration,
                fieldMetadataUniversalIdentifierById:
                  flatFieldMetadataMaps.universalIdentifierById,
                frontComponentUniversalIdentifierById:
                  flatFrontComponentMaps.universalIdentifierById,
                viewFieldGroupUniversalIdentifierById:
                  flatViewFieldGroupMaps.universalIdentifierById,
                viewUniversalIdentifierById:
                  flatViewMaps.universalIdentifierById,
              }),
          }),
        };
      },
    );

    const widgetsToRestoreAndUpdate: FlatPageLayoutWidget[] =
      entitiesToRestoreAndUpdate.map((widgetInput) => {
        const existingWidget = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: widgetInput.id,
          flatEntityMaps: flatPageLayoutWidgetMaps,
        });

        const restoredConfiguration = widgetInput.configuration ?? null;

        const {
          pageLayoutTabUniversalIdentifier,
          objectMetadataUniversalIdentifier,
        } = resolveEntityRelationUniversalIdentifiers({
          metadataName: 'pageLayoutWidget',
          foreignKeyValues: {
            pageLayoutTabId: widgetInput.pageLayoutTabId,
            objectMetadataId: widgetInput.objectMetadataId,
          },
          flatEntityMaps: { flatPageLayoutTabMaps, flatObjectMetadataMaps },
        });

        return {
          ...existingWidget,
          pageLayoutTabId: widgetInput.pageLayoutTabId,
          pageLayoutTabUniversalIdentifier,
          title: widgetInput.title,
          type: widgetInput.type,
          objectMetadataId: widgetInput.objectMetadataId ?? null,
          objectMetadataUniversalIdentifier,
          gridPosition: widgetInput.gridPosition,
          position: widgetInput.position ?? null,
          configuration: restoredConfiguration,
          deletedAt: null,
          updatedAt: now.toISOString(),
          ...(isDefined(restoredConfiguration) && {
            universalConfiguration:
              fromPageLayoutWidgetConfigurationToUniversalConfiguration({
                configuration: restoredConfiguration,
                fieldMetadataUniversalIdentifierById:
                  flatFieldMetadataMaps.universalIdentifierById,
                frontComponentUniversalIdentifierById:
                  flatFrontComponentMaps.universalIdentifierById,
                viewFieldGroupUniversalIdentifierById:
                  flatViewFieldGroupMaps.universalIdentifierById,
                viewUniversalIdentifierById:
                  flatViewMaps.universalIdentifierById,
              }),
          }),
        };
      });

    const widgetsToDelete: FlatPageLayoutWidget[] = idsToDelete
      .map((widgetId) => {
        const existingWidget = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: widgetId,
          flatEntityMaps: flatPageLayoutWidgetMaps,
        });

        if (!isDefined(existingWidget)) {
          return null;
        }

        return {
          ...existingWidget,
          deletedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
      })
      .filter(isDefined);

    return {
      widgetsToCreate,
      widgetsToUpdate: [
        ...widgetsToUpdate,
        ...widgetsToRestoreAndUpdate,
        ...widgetsToDelete,
      ],
    };
  }
}
