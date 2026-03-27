import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { type PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

import { DashboardLayoutService } from './dashboard-layout.service';

describe('DashboardLayoutService', () => {
  let service: DashboardLayoutService;
  let dashboardRepository: Pick<
    WorkspaceRepository<DashboardWorkspaceEntity>,
    'findOne'
  >;
  let globalWorkspaceOrmManager: Pick<
    GlobalWorkspaceOrmManager,
    'getRepository'
  >;
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

  it('should skip preset hydration when the URL presetId is an empty string', async () => {
    (dashboardRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'dashboard-1',
      pageLayoutId: 'layout-1',
    });
    (pageLayoutService.findByIdOrThrow as jest.Mock).mockResolvedValue({
      id: 'layout-1',
      name: 'Pipeline Layout',
      type: 'DASHBOARD',
    });

    const result = await service.getDashboardLayoutByUrl({
      dashboardId: 'dashboard-1',
      presetId: '',
      workspaceId: 'workspace-1',
    });

    expect(pageLayoutService.getPresetById).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: 'layout-1',
      name: 'Pipeline Layout',
      type: 'DASHBOARD',
      activePresetFilterState: null,
    });
  });

  it('should fall back to raw URL filters when the requested preset cannot be resolved', async () => {
    (dashboardRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'dashboard-1',
      pageLayoutId: 'layout-1',
    });
    (pageLayoutService.findByIdOrThrow as jest.Mock).mockResolvedValue({
      id: 'layout-1',
      name: 'Pipeline Layout',
      type: 'DASHBOARD',
    });
    (pageLayoutService.getPresetById as jest.Mock).mockRejectedValue(
      new PageLayoutException(
        'Dashboard preset with ID "missing-preset" not found',
        PageLayoutExceptionCode.DASHBOARD_PRESET_NOT_FOUND,
      ),
    );

    const result = await service.getDashboardLayoutByUrl({
      dashboardId: 'dashboard-1',
      presetId: 'missing-preset',
      workspaceId: 'workspace-1',
    });

    expect(pageLayoutService.getPresetById).toHaveBeenCalledWith({
      presetId: 'missing-preset',
      pageLayoutId: 'layout-1',
      workspaceId: 'workspace-1',
    });
    expect(result).toEqual({
      id: 'layout-1',
      name: 'Pipeline Layout',
      type: 'DASHBOARD',
      activePresetFilterState: null,
    });
  });
});
