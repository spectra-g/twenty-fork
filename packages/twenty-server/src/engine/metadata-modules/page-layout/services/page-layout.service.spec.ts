import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

describe('PageLayoutService', () => {
  const baseFlatLayout = {
    id: 'page-layout-id',
    name: 'Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: 'object-metadata-id',
    universalIdentifier: 'page-layout-universal-id',
    workspaceId: 'workspace-id',
    createdAt: '2026-04-02T00:00:00.000Z',
    updatedAt: '2026-04-02T00:00:00.000Z',
    deletedAt: null,
    tabIds: [],
    defaultTabToFocusOnMobileAndSidePanelId: null,
  };

  const createService = ({
    filterSupport,
  }: {
    filterSupport: boolean;
  }): PageLayoutService => {
    return new PageLayoutService(
      {} as any,
      {} as any,
      {
        getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
          flatPageLayoutMaps: {
            byUniversalIdentifier: {
              [baseFlatLayout.universalIdentifier]: baseFlatLayout,
            },
            universalIdentifierById: {
              [baseFlatLayout.id]: baseFlatLayout.universalIdentifier,
            },
            universalIdentifiersByApplicationId: {},
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
        }),
      } as any,
      {} as any,
      {} as any,
      {
        getFilterSupportMap: jest
          .fn()
          .mockResolvedValue(new Map([[baseFlatLayout.id, filterSupport]])),
      } as any,
    );
  };

  it('returns filterSupport true when the linked dashboard enables it', async () => {
    const service = createService({ filterSupport: true });

    const result = await service.findByIdOrThrow({
      id: baseFlatLayout.id,
      workspaceId: 'workspace-id',
    });

    expect(result).toMatchObject({
      id: baseFlatLayout.id,
      type: PageLayoutType.DASHBOARD,
      filterSupport: true,
    });
  });

  it('returns filterSupport false when no linked dashboard enables it', async () => {
    const service = createService({ filterSupport: false });

    const result = await service.findByIdOrThrow({
      id: baseFlatLayout.id,
      workspaceId: 'workspace-id',
    });

    expect(result).toMatchObject({
      id: baseFlatLayout.id,
      type: PageLayoutType.DASHBOARD,
      filterSupport: false,
    });
  });
});
