import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { DashboardAccessService } from 'src/modules/dashboard/services/dashboard-access.service';

@Injectable()
export class CreateDashboardPresetPermissionGuard implements CanActivate {
  constructor(
    private readonly dashboardAccessService: DashboardAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    return this.dashboardAccessService.canCreatePreset({
      workspaceId: request.workspace.id,
      userWorkspaceId: request.userWorkspaceId,
      apiKeyId: request.apiKey?.id,
      applicationId: request.application?.id,
    });
  }
}
