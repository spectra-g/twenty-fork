import { PageLayoutResolver } from 'src/engine/metadata-modules/page-layout/resolvers/page-layout.resolver';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PageLayoutDashboardFilterStateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-dashboard-filter-state.service';

describe('PageLayoutResolver dashboard filters', () => {
  let resolver: PageLayoutResolver;

  const pageLayoutService = {
    findByIdOrThrow: jest.fn(),
  };

  const pageLayoutUpdateService = {
    updatePageLayoutWithTabs: jest.fn(),
  };

  beforeEach(() => {
    resolver = new PageLayoutResolver(
      pageLayoutService as never,
      pageLayoutUpdateService as never,
      new PageLayoutDashboardFilterStateService(),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns null filter fields when no dashboard filter state has been stored for the page layout', async () => {
    pageLayoutService.findByIdOrThrow.mockResolvedValue({
      id: 'page-layout-id',
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [],
      createdAt: new Date('2026-03-31T00:00:00.000Z'),
      updatedAt: new Date('2026-03-31T00:00:00.000Z'),
      deletedAt: null,
    });

    await expect(
      resolver.getPageLayout('page-layout-id', { id: 'workspace-id' } as never),
    ).resolves.toMatchObject({
      id: 'page-layout-id',
      recordFilters: null,
      recordFilterGroups: null,
    });
  });

  it('returns updated dashboard filter fields and exposes them on later reads', async () => {
    const updatedLayout = {
      id: 'page-layout-id',
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [],
      createdAt: new Date('2026-03-31T00:00:00.000Z'),
      updatedAt: new Date('2026-03-31T00:00:00.000Z'),
      deletedAt: null,
    };

    const input = {
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [],
      recordFilters: [{ fieldMetadataId: 'status', value: 'active' }],
      recordFilterGroups: [{ id: 'root', logicalOperator: 'AND' }],
    };

    pageLayoutUpdateService.updatePageLayoutWithTabs.mockResolvedValue(
      updatedLayout,
    );
    pageLayoutService.findByIdOrThrow.mockResolvedValue(updatedLayout);

    await expect(
      resolver.updatePageLayoutWithTabsAndWidgets(
        'page-layout-id',
        input as never,
        { id: 'workspace-id' } as never,
      ),
    ).resolves.toMatchObject({
      id: 'page-layout-id',
      recordFilters: input.recordFilters,
      recordFilterGroups: input.recordFilterGroups,
    });

    await expect(
      resolver.getPageLayout('page-layout-id', { id: 'workspace-id' } as never),
    ).resolves.toMatchObject({
      id: 'page-layout-id',
      recordFilters: input.recordFilters,
      recordFilterGroups: input.recordFilterGroups,
    });
  });
});
