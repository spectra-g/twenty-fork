import { PageLayoutResolver } from 'src/engine/metadata-modules/page-layout/resolvers/page-layout.resolver';
import { type PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';
import { type PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';

const mockPageLayoutService = {
  findBy: jest.fn(),
  findByWorkspaceId: jest.fn(),
  findByIdOrThrow: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

const mockPageLayoutUpdateService = {
  updatePageLayoutWithTabs: jest.fn(),
  createPreset: jest.fn(),
  renamePreset: jest.fn(),
};

describe('PageLayoutResolver dashboard filters', () => {
  let pageLayoutResolver: PageLayoutResolver;

  beforeEach(() => {
    jest.clearAllMocks();

    pageLayoutResolver = new PageLayoutResolver(
      mockPageLayoutService as PageLayoutService,
      mockPageLayoutUpdateService as PageLayoutUpdateService,
    );
  });

  it('should pass dashboardFilters to page layout update service', async () => {
    const input = {
      name: 'Dashboard Layout',
      type: 'DASHBOARD',
      objectMetadataId: null,
      dashboardFilters: [
        {
          fieldMetadataId: 'field-1',
          operand: 'EQ',
          value: 'OPEN',
        },
      ],
      tabs: [],
    };

    mockPageLayoutUpdateService.updatePageLayoutWithTabs.mockResolvedValue({
      id: 'layout-1',
      ...input,
    });

    await pageLayoutResolver.updatePageLayoutWithTabsAndWidgets(
      'layout-1',
      input as never,
      { id: 'workspace-1' } as never,
    );

    expect(
      mockPageLayoutUpdateService.updatePageLayoutWithTabs,
    ).toHaveBeenCalledWith({
      id: 'layout-1',
      workspaceId: 'workspace-1',
      input,
    });
  });

  it('should create a dashboard preset through the page layout update service', async () => {
    const input = {
      pageLayoutId: 'layout-1',
      name: 'Sales View',
      filterState: {
        stage: {
          eq: 'OPEN',
        },
      },
    };

    mockPageLayoutUpdateService.createPreset.mockResolvedValue({
      id: 'preset_1',
      ...input,
    });

    const result = await pageLayoutResolver.createDashboardPreset(
      input as never,
      { id: 'workspace-1' } as never,
    );

    expect(mockPageLayoutUpdateService.createPreset).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      input,
    });
    expect(result).toEqual({
      id: 'preset_1',
      ...input,
    });
  });

  it('should rename a dashboard preset through the page layout update service', async () => {
    const input = {
      presetId: 'preset_1',
      newName: 'Q1 Sales',
    };

    mockPageLayoutUpdateService.renamePreset.mockResolvedValue({
      id: 'preset_1',
      name: 'Q1 Sales',
      filterState: {},
    });

    const result = await pageLayoutResolver.renameDashboardPreset(
      input as never,
      { id: 'workspace-1' } as never,
    );

    expect(mockPageLayoutUpdateService.renamePreset).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      input,
    });
    expect(result).toEqual({
      id: 'preset_1',
      name: 'Q1 Sales',
      filterState: {},
    });
  });
});
