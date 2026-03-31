import { PermissionFlagType } from 'twenty-shared/constants';

import {
  type PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { DashboardAccessService } from 'src/modules/dashboard/services/dashboard-access.service';

describe('DashboardAccessService', () => {
  let service: DashboardAccessService;
  let mockDashboardFilterService: {
    findDashboardPresetById: jest.Mock;
  };
  let mockPermissionsService: {
    userHasWorkspaceSettingPermission: jest.Mock;
  };
  let mockUserRoleService: {
    getRolesByUserWorkspaces: jest.Mock;
  };

  beforeEach(() => {
    mockDashboardFilterService = {
      findDashboardPresetById: jest.fn(),
    };
    mockPermissionsService = {
      userHasWorkspaceSettingPermission: jest.fn().mockResolvedValue(true),
    };
    mockUserRoleService = {
      getRolesByUserWorkspaces: jest.fn().mockResolvedValue(new Map()),
    };

    service = new DashboardAccessService(
      mockDashboardFilterService as never,
      mockPermissionsService as never,
      mockUserRoleService as never,
    );
  });

  it('should reject preset creation when the user lacks layouts permission', async () => {
    mockPermissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      false,
    );

    await expect(
      service.canCreatePreset({
        workspaceId: 'workspace-id',
        userWorkspaceId: 'user-workspace-id',
      }),
    ).rejects.toMatchObject<Partial<PermissionsException>>({
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });

    expect(
      mockPermissionsService.userHasWorkspaceSettingPermission,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      apiKeyId: undefined,
      applicationId: undefined,
      setting: PermissionFlagType.LAYOUTS,
    });
  });

  it('should allow preset creation when the user has layouts permission', async () => {
    await expect(
      service.canCreatePreset({
        workspaceId: 'workspace-id',
        userWorkspaceId: 'user-workspace-id',
      }),
    ).resolves.toBe(true);
  });

  it('should reject preset rename when the user is neither owner nor workspace admin', async () => {
    mockDashboardFilterService.findDashboardPresetById.mockResolvedValue({
      id: 'preset-id',
      createdBy: {
        id: 'creator-id',
        name: 'Preset Owner',
      },
    });
    mockUserRoleService.getRolesByUserWorkspaces.mockResolvedValue(
      new Map([
        [
          'user-workspace-id',
          [
            {
              canUpdateAllSettings: false,
            },
          ],
        ],
      ]),
    );

    await expect(
      service.canUpdatePreset({
        presetId: 'preset-id',
        workspaceId: 'workspace-id',
        userId: 'other-user-id',
        userWorkspaceId: 'user-workspace-id',
      }),
    ).rejects.toMatchObject<Partial<PermissionsException>>({
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });
  });

  it('should allow preset rename when the user owns the preset', async () => {
    mockDashboardFilterService.findDashboardPresetById.mockResolvedValue({
      id: 'preset-id',
      createdBy: {
        id: 'user-id',
        name: 'Preset Owner',
      },
    });

    await expect(
      service.canUpdatePreset({
        presetId: 'preset-id',
        workspaceId: 'workspace-id',
        userId: 'user-id',
        userWorkspaceId: 'user-workspace-id',
      }),
    ).resolves.toBe(true);
  });

  it('should allow preset rename when the user is a workspace admin', async () => {
    mockDashboardFilterService.findDashboardPresetById.mockResolvedValue({
      id: 'preset-id',
      createdBy: {
        id: 'creator-id',
        name: 'Preset Owner',
      },
    });
    mockUserRoleService.getRolesByUserWorkspaces.mockResolvedValue(
      new Map([
        [
          'user-workspace-id',
          [
            {
              canUpdateAllSettings: true,
            },
          ],
        ],
      ]),
    );

    await expect(
      service.canUpdatePreset({
        presetId: 'preset-id',
        workspaceId: 'workspace-id',
        userId: 'other-user-id',
        userWorkspaceId: 'user-workspace-id',
      }),
    ).resolves.toBe(true);
  });
});
