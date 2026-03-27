import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

import { DashboardLayoutService } from './dashboard-layout.service';

describe('DashboardLayoutService', () => {
  let service: DashboardLayoutService;
  let dashboardRepository: Pick<
    WorkspaceRepository<DashboardWorkspaceEntity>,
    'findOne'
  >;
  let globalWorkspaceOrmManager: Pick<GlobalWorkspaceOrmManager, 'getRepository'>;
  let pageLayoutService: Pick<
    PageLayoutService,
    'findByIdOrThrow' | 'getPresetById'
  >;

  beforeEach(() => {
    dashboardRepository = {
      findOne: jest.fn(),
    };

    globalWorkspaceOrmManager = {
      getRepository: jest.fn().mockResolvedValue(dashboardRepository),
    };

    pageLayoutService = {
      findByIdOrThrow: jest.fn(),
      getPresetById: jest.fn(),
    };

    service = new DashboardLayoutService(
      globalWorkspaceOrmManager as GlobalWorkspaceOrmManager,
      pageLayoutService as PageLayoutService,
    );
  });

  it('should resolve a dashboard layout by dashboard id and apply the active preset filter state', async () => {
    (dashboardRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'dashboard-1',
      pageLayoutId: 'layout-1',
    });
    (pageLayoutService.findByIdOrThrow as jest.Mock).mockResolvedValue({
      id: 'layout-1',
      name: 'Pipeline Layout',
      type: 'DASHBOARD',
    });
    (pageLayoutService.getPresetById as jest.Mock).mockResolvedValue({
      id: 'preset_1',
      name: 'Sales View',
      filterState: {
        stage: {
          eq: 'OPEN',
        },
      },
    });

    const result = await service.getDashboardLayoutByUrl({
      dashboardId: 'dashboard-1',
      presetId: 'preset_1',
      workspaceId: 'workspace-1',
    });

    expect(globalWorkspaceOrmManager.getRepository).toHaveBeenCalledWith(
      'workspace-1',
      'dashboard',
      { shouldBypassPermissionChecks: true },
    );
    expect(pageLayoutService.findByIdOrThrow).toHaveBeenCalledWith({
      id: 'layout-1',
      workspaceId: 'workspace-1',
    });
    expect(pageLayoutService.getPresetById).toHaveBeenCalledWith({
      presetId: 'preset_1',
      pageLayoutId: 'layout-1',
      workspaceId: 'workspace-1',
    });
    expect(result).toEqual({
      id: 'layout-1',
      name: 'Pipeline Layout',
      type: 'DASHBOARD',
      activePresetFilterState: {
        stage: {
          eq: 'OPEN',
        },
      },
    });
  });
});
