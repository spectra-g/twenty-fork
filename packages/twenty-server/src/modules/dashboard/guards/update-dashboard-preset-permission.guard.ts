import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { DashboardAccessService } from 'src/modules/dashboard/services/dashboard-access.service';

@Injectable()
export class UpdateDashboardPresetPermissionGuard implements CanActivate {
  constructor(
    private readonly dashboardAccessService: DashboardAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();

    return this.dashboardAccessService.canUpdatePreset({
      presetId: typeof args?.id === 'string' ? args.id : null,
      workspaceId: request.workspace.id,
      userId: request.user?.id,
      userWorkspaceId: request.userWorkspaceId,
      apiKeyId: request.apiKey?.id,
      applicationId: request.application?.id,
    });
  }
}
