import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PageLayoutFilterSupportService } from 'src/engine/metadata-modules/page-layout/services/page-layout-filter-support.service';

describe('PageLayoutFilterSupportService', () => {
  const getRepository = jest.fn();
  const executeInWorkspaceContext = jest.fn((callback) => callback());
  const isFeatureEnabled = jest.fn();

  const createService = () =>
    new PageLayoutFilterSupportService(
      {
        executeInWorkspaceContext,
        getRepository,
      } as any,
      {
        isFeatureEnabled,
      } as any,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    isFeatureEnabled.mockResolvedValue(true);
  });

  it('returns false for legacy dashboards when filterBarEnabled is false', async () => {
    getRepository.mockResolvedValue({
      find: jest.fn().mockResolvedValue([
        {
          pageLayoutId: 'dashboard-layout-id',
          filterBarEnabled: false,
        },
      ]),
    });

    const filterSupportMap = await createService().getFilterSupportMap({
      workspaceId: 'workspace-id',
      pageLayouts: [
        {
          id: 'dashboard-layout-id',
          type: PageLayoutType.DASHBOARD,
        },
      ],
    });

    expect(filterSupportMap.get('dashboard-layout-id')).toBe(false);
  });

  it('returns false when IS_DASHBOARD_V2_ENABLED is disabled even if the dashboard enables filter support', async () => {
    isFeatureEnabled.mockResolvedValue(false);

    const filterSupportMap = await createService().getFilterSupportMap({
      workspaceId: 'workspace-id',
      pageLayouts: [
        {
          id: 'dashboard-layout-id',
          type: PageLayoutType.DASHBOARD,
        },
      ],
    });

    expect(isFeatureEnabled).toHaveBeenCalledWith(
      FeatureFlagKey.IS_DASHBOARD_V2_ENABLED,
      'workspace-id',
    );
    expect(getRepository).not.toHaveBeenCalled();
    expect(filterSupportMap.get('dashboard-layout-id')).toBe(false);
  });
});
