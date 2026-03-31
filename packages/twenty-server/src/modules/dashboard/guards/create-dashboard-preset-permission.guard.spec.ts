import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { CreateDashboardPresetPermissionGuard } from 'src/modules/dashboard/guards/create-dashboard-preset-permission.guard';

describe('CreateDashboardPresetPermissionGuard', () => {
  const mockExecutionContext = {} as ExecutionContext;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should delegate create authorization to the dashboard access service', async () => {
    const mockDashboardAccessService = {
      canCreatePreset: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => ({
        req: {
          workspace: { id: 'workspace-id' },
          userWorkspaceId: 'user-workspace-id',
          apiKey: undefined,
          application: undefined,
        },
      }),
    } as never);

    const guard = new CreateDashboardPresetPermissionGuard(
      mockDashboardAccessService as never,
    );

    await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(true);
    expect(mockDashboardAccessService.canCreatePreset).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      apiKeyId: undefined,
      applicationId: undefined,
    });
  });
});
