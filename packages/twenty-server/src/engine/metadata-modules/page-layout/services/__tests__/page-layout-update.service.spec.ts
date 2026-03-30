import { Test, type TestingModule } from '@nestjs/testing';

import { AggregateOperations } from 'twenty-shared/types';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { DashboardSyncService } from 'src/modules/dashboard-sync/services/dashboard-sync.service';

describe('PageLayoutUpdateService', () => {
  let service: PageLayoutUpdateService;
  let mockGetOrRecomputeManyOrAllFlatEntityMaps: jest.Mock;
  let mockValidateBuildAndRunWorkspaceMigration: jest.Mock;
  let mockFindWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.Mock;
  let mockUpdateLinkedDashboardsUpdatedAtByPageLayoutId: jest.Mock;

  const workspaceId = 'workspace-id';
  const pageLayoutId = 'page-layout-id';
  const tabId = 'tab-id';
  const widgetId = 'widget-id';
  const objectMetadataId = 'object-metadata-id';
  const fieldMetadataId = 'field-metadata-id';
  const applicationId = 'application-id';
  const applicationUniversalIdentifier = 'application-universal-id';

  const existingWidgetConfiguration = {
    configurationType: WidgetConfigurationType.PIE_CHART,
    aggregateFieldMetadataId: fieldMetadataId,
    aggregateOperation: AggregateOperations.COUNT,
    groupByFieldMetadataId: fieldMetadataId,
    filter: {
      recordFilters: [
        {
          fieldMetadataId,
          operand: 'is',
          value: '["WON"]',
        },
      ],
      recordFilterGroups: [],
    },
  } as const;

  const existingPageLayout = {
    id: pageLayoutId,
    name: 'Existing layout',
    type: PageLayoutType.RECORD_PAGE,
    objectMetadataId: null,
    workspaceId,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    universalIdentifier: pageLayoutId,
    applicationId,
    applicationUniversalIdentifier,
    tabIds: [tabId],
    tabUniversalIdentifiers: [tabId],
  };

  const existingTab = {
    id: tabId,
    title: 'Tab 1',
    position: 0,
    pageLayoutId,
    pageLayoutUniversalIdentifier: pageLayoutId,
    workspaceId,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    universalIdentifier: tabId,
    applicationId,
    applicationUniversalIdentifier,
    widgetIds: [widgetId],
    widgetUniversalIdentifiers: [widgetId],
    icon: null,
    layoutMode: 'GRID',
  };

  const existingWidget = {
    id: widgetId,
    pageLayoutTabId: tabId,
    pageLayoutTabUniversalIdentifier: tabId,
    title: 'Widget 1',
    type: WidgetType.GRAPH,
    objectMetadataId,
    objectMetadataUniversalIdentifier: objectMetadataId,
    gridPosition: {
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 1,
    },
    position: null,
    configuration: existingWidgetConfiguration,
    workspaceId,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    universalIdentifier: widgetId,
    applicationId,
    applicationUniversalIdentifier,
    conditionalDisplay: null,
    universalConfiguration: {
      configurationType: WidgetConfigurationType.PIE_CHART,
      aggregateFieldMetadataUniversalIdentifier: 'field-universal-id',
      aggregateOperation: AggregateOperations.COUNT,
      groupByFieldMetadataUniversalIdentifier: 'field-universal-id',
      filter: {
        recordFilters: [
          {
            operand: 'is',
            value: '["WON"]',
            fieldMetadataUniversalIdentifier: 'field-universal-id',
          },
        ],
        recordFilterGroups: [],
      },
    },
  };

  const flatEntityMaps = {
    flatPageLayoutMaps: {
      byUniversalIdentifier: {
        [pageLayoutId]: existingPageLayout,
      },
      universalIdentifierById: {
        [pageLayoutId]: pageLayoutId,
      },
      universalIdentifiersByApplicationId: {},
    },
    flatPageLayoutTabMaps: {
      byUniversalIdentifier: {
        [tabId]: existingTab,
      },
      universalIdentifierById: {
        [tabId]: tabId,
      },
      universalIdentifiersByApplicationId: {},
    },
    flatPageLayoutWidgetMaps: {
      byUniversalIdentifier: {
        [widgetId]: existingWidget,
      },
      universalIdentifierById: {
        [widgetId]: widgetId,
      },
      universalIdentifiersByApplicationId: {},
    },
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        [objectMetadataId]: {
          id: objectMetadataId,
          universalIdentifier: objectMetadataId,
          nameSingular: 'company',
        },
      },
      universalIdentifierById: {
        [objectMetadataId]: objectMetadataId,
      },
      universalIdentifiersByApplicationId: {},
    },
    flatFieldMetadataMaps: {
      byUniversalIdentifier: {
        'field-universal-id': {
          id: fieldMetadataId,
          universalIdentifier: 'field-universal-id',
          name: 'stage',
          label: 'Stage',
          type: 'SELECT',
          options: [],
        },
      },
      universalIdentifierById: {
        [fieldMetadataId]: 'field-universal-id',
      },
      universalIdentifiersByApplicationId: {},
    },
    flatFrontComponentMaps: {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    },
    flatViewFieldGroupMaps: {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    },
    flatViewMaps: {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    },
  };

  beforeEach(async () => {
    mockGetOrRecomputeManyOrAllFlatEntityMaps = jest
      .fn()
      .mockResolvedValueOnce({
        flatPageLayoutMaps: flatEntityMaps.flatPageLayoutMaps,
        flatPageLayoutTabMaps: flatEntityMaps.flatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps: flatEntityMaps.flatPageLayoutWidgetMaps,
      })
      .mockResolvedValueOnce({
        flatObjectMetadataMaps: flatEntityMaps.flatObjectMetadataMaps,
        flatFieldMetadataMaps: flatEntityMaps.flatFieldMetadataMaps,
        flatFrontComponentMaps: flatEntityMaps.flatFrontComponentMaps,
        flatViewFieldGroupMaps: flatEntityMaps.flatViewFieldGroupMaps,
        flatViewMaps: flatEntityMaps.flatViewMaps,
      })
      .mockResolvedValueOnce({
        flatPageLayoutMaps: flatEntityMaps.flatPageLayoutMaps,
        flatPageLayoutTabMaps: flatEntityMaps.flatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps: flatEntityMaps.flatPageLayoutWidgetMaps,
      });

    mockValidateBuildAndRunWorkspaceMigration = jest
      .fn()
      .mockResolvedValue({ status: 'success' });
    mockFindWorkspaceTwentyStandardAndCustomApplicationOrThrow = jest
      .fn()
      .mockResolvedValue({
        workspaceCustomFlatApplication: {
          id: applicationId,
          universalIdentifier: applicationUniversalIdentifier,
        },
      });
    mockUpdateLinkedDashboardsUpdatedAtByPageLayoutId = jest
      .fn()
      .mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageLayoutUpdateService,
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: {
            validateBuildAndRunWorkspaceMigration:
              mockValidateBuildAndRunWorkspaceMigration,
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps:
              mockGetOrRecomputeManyOrAllFlatEntityMaps,
          },
        },
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
              mockFindWorkspaceTwentyStandardAndCustomApplicationOrThrow,
          },
        },
        {
          provide: DashboardSyncService,
          useValue: {
            updateLinkedDashboardsUpdatedAtByPageLayoutId:
              mockUpdateLinkedDashboardsUpdatedAtByPageLayoutId,
          },
        },
      ],
    }).compile();

    service = module.get<PageLayoutUpdateService>(PageLayoutUpdateService);
  });

  it('should preserve an existing widget configuration when the update omits it (AC-003)', async () => {
    await service.updatePageLayoutWithTabs({
      id: pageLayoutId,
      workspaceId,
      input: {
        name: 'Updated layout',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        tabs: [
          {
            id: tabId,
            title: 'Tab 1',
            position: 0,
            widgets: [
              {
                id: widgetId,
                pageLayoutTabId: tabId,
                title: 'Widget 1',
                type: WidgetType.GRAPH,
                objectMetadataId,
                gridPosition: {
                  row: 0,
                  column: 0,
                  rowSpan: 1,
                  columnSpan: 1,
                },
                configuration: undefined as never,
              },
            ],
          },
        ],
      },
    });

    expect(
      mockValidateBuildAndRunWorkspaceMigration,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        allFlatEntityOperationByMetadataName: expect.objectContaining({
          pageLayoutWidget: expect.objectContaining({
            flatEntityToUpdate: [
              expect.objectContaining({
                id: widgetId,
                configuration: existingWidgetConfiguration,
              }),
            ],
          }),
        }),
      }),
    );
  });
});
