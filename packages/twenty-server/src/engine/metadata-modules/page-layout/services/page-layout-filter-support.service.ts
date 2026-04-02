import { Injectable } from '@nestjs/common';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

@Injectable()
export class PageLayoutFilterSupportService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async getFilterSupportMap({
    workspaceId,
    pageLayouts,
  }: {
    workspaceId: string;
    pageLayouts: Array<{ id: string; type: PageLayoutType }>;
  }): Promise<Map<string, boolean>> {
    const filterSupportMap = new Map<string, boolean>(
      pageLayouts.map((pageLayout) => [pageLayout.id, false]),
    );

    const dashboardPageLayoutIds = pageLayouts
      .filter((pageLayout) => pageLayout.type === PageLayoutType.DASHBOARD)
      .map((pageLayout) => pageLayout.id);

    if (dashboardPageLayoutIds.length === 0) {
      return filterSupportMap;
    }

    const dashboards =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const dashboardRepository =
            await this.globalWorkspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
              workspaceId,
              'dashboard',
              { shouldBypassPermissionChecks: true },
            );

          return dashboardRepository.find({
            select: {
              pageLayoutId: true,
            },
            where: dashboardPageLayoutIds.map((pageLayoutId) => ({
              pageLayoutId,
            })),
          });
        },
        buildSystemAuthContext(workspaceId),
      );

    for (const dashboard of dashboards) {
      if (dashboard.pageLayoutId) {
        filterSupportMap.set(dashboard.pageLayoutId, true);
      }
    }

    return filterSupportMap;
  }
}
