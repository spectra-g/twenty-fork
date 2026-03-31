import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PageLayoutDashboardFilterStateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-dashboard-filter-state.service';

describe('PageLayoutDashboardFilterStateService', () => {
  const getRepository = jest.fn();
  const executeInWorkspaceContext = jest.fn();

  const globalWorkspaceOrmManager = {
    getRepository,
    executeInWorkspaceContext,
  };

  const pageLayout = {
    id: 'page-layout-id',
    name: 'Dashboard',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    tabs: [],
    createdAt: new Date('2026-03-31T00:00:00.000Z'),
    updatedAt: new Date('2026-03-31T00:00:00.000Z'),
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    executeInWorkspaceContext.mockImplementation(async (callback) => {
      await callback();
    });
  });

  it('loads persisted dashboard filter state from the linked dashboard record', async () => {
    const findOne = jest.fn().mockResolvedValue({
      recordFilters: [{ fieldMetadataId: 'status', value: 'active' }],
      recordFilterGroups: [{ id: 'root', logicalOperator: 'AND' }],
    });

    getRepository.mockResolvedValue({ findOne });

    const service = new PageLayoutDashboardFilterStateService(
      globalWorkspaceOrmManager as never,
    );

    await expect(
      service.getPageLayoutWithDashboardFilterState({
        pageLayout,
        workspaceId: 'workspace-id',
      }),
    ).resolves.toMatchObject({
      id: 'page-layout-id',
      recordFilters: [{ fieldMetadataId: 'status', value: 'active' }],
      recordFilterGroups: [{ id: 'root', logicalOperator: 'AND' }],
    });

    expect(findOne).toHaveBeenCalledWith({
      where: {
        pageLayoutId: 'page-layout-id',
      },
      select: ['recordFilters', 'recordFilterGroups'],
    });
  });

  it('persists dashboard filter state to the linked dashboard record', async () => {
    const update = jest.fn().mockResolvedValue({ affected: 1 });

    getRepository.mockResolvedValue({ update });

    const service = new PageLayoutDashboardFilterStateService(
      globalWorkspaceOrmManager as never,
    );

    await service.saveDashboardFilterStateForPageLayout({
      workspaceId: 'workspace-id',
      pageLayoutId: 'page-layout-id',
      recordFilters: [{ fieldMetadataId: 'status', value: 'active' }],
      recordFilterGroups: [{ id: 'root', logicalOperator: 'AND' }],
    });

    expect(update).toHaveBeenCalledWith(
      { pageLayoutId: 'page-layout-id' },
      {
        recordFilters: [{ fieldMetadataId: 'status', value: 'active' }],
        recordFilterGroups: [{ id: 'root', logicalOperator: 'AND' }],
      },
    );
  });
});
