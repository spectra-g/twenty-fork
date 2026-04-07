/* eslint-disable @nx/enforce-module-boundaries */
import { type ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { DashboardResolver } from 'src/modules/dashboard/resolvers/dashboard.resolver';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

const mutationMethodNames = [
  'createDashboardPreset',
  'updateDashboardPreset',
  'deleteDashboardPreset',
] as const;

describe('DashboardResolver permission guards', () => {
  let mockExecutionContext: ExecutionContext;
  let mockPermissionsService: jest.Mocked<PermissionsService>;
  let mockGqlContext: {
    req: {
      workspace: {
        id: string;
        activationStatus: WorkspaceActivationStatus;
      };
      userWorkspaceId: string;
      apiKey: null;
    };
  };

  beforeEach(() => {
    mockExecutionContext = {} as ExecutionContext;
    mockPermissionsService = {
      userHasWorkspaceSettingPermission: jest.fn(),
    } as any;
    mockGqlContext = {
      req: {
        workspace: {
          id: 'workspace-id',
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
        userWorkspaceId: 'user-workspace-id',
        apiKey: null,
      },
    };

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue({ getContext: () => mockGqlContext } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(mutationMethodNames)(
    'should require layouts permission for %s',
    async (methodName) => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        DashboardResolver.prototype[methodName],
      );

      expect(guards).toHaveLength(1);

      const [GuardClass] = guards;
      const guard = new GuardClass(mockPermissionsService);

      mockPermissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        true,
      );

      await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(true);
      expect(
        mockPermissionsService.userHasWorkspaceSettingPermission,
      ).toHaveBeenCalledWith({
        userWorkspaceId: 'user-workspace-id',
        setting: PermissionFlagType.LAYOUTS,
        workspaceId: 'workspace-id',
        apiKeyId: undefined,
        applicationId: undefined,
      });
    },
  );

  it('should deny dashboard preset creation when layouts permission is missing', async () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      DashboardResolver.prototype.createDashboardPreset,
    );

    const [GuardClass] = guards;
    const guard = new GuardClass(mockPermissionsService);

    mockPermissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      false,
    );

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      PermissionsException,
    );
  });
});
