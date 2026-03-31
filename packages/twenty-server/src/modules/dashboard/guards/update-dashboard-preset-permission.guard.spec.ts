import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { UpdateDashboardPresetPermissionGuard } from 'src/modules/dashboard/guards/update-dashboard-preset-permission.guard';

describe('UpdateDashboardPresetPermissionGuard', () => {
  const mockExecutionContext = {} as ExecutionContext;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should delegate rename authorization to the dashboard access service', async () => {
    const mockDashboardAccessService = {
      canUpdatePreset: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => ({
        req: {
          workspace: { id: 'workspace-id' },
          user: { id: 'user-id' },
          userWorkspaceId: 'user-workspace-id',
          apiKey: undefined,
          application: undefined,
        },
      }),
      getArgs: () => ({
        id: 'preset-id',
      }),
    } as never);

    const guard = new UpdateDashboardPresetPermissionGuard(
      mockDashboardAccessService as never,
    );

    await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(true);
    expect(mockDashboardAccessService.canUpdatePreset).toHaveBeenCalledWith({
      presetId: 'preset-id',
      workspaceId: 'workspace-id',
      userId: 'user-id',
      userWorkspaceId: 'user-workspace-id',
      apiKeyId: undefined,
      applicationId: undefined,
    });
  });
});
