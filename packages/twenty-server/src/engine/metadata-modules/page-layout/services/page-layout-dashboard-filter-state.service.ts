import { Injectable } from '@nestjs/common';

import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

type PageLayoutDashboardFilterState = {
  recordFilters: unknown[] | null;
  recordFilterGroups: unknown[] | null;
};

@Injectable()
export class PageLayoutDashboardFilterStateService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async getPageLayoutWithDashboardFilterState({
    pageLayout,
    workspaceId,
  }: {
    pageLayout: PageLayoutDTO;
    workspaceId: string;
  }): Promise<PageLayoutDTO> {
    const dashboardFilterState =
      await this.findDashboardFilterStateByPageLayoutId({
        pageLayoutId: pageLayout.id,
        workspaceId,
      });

    return {
      ...pageLayout,
      recordFilters: dashboardFilterState?.recordFilters ?? null,
      recordFilterGroups: dashboardFilterState?.recordFilterGroups ?? null,
    };
  }

  async saveDashboardFilterStateForPageLayout({
    workspaceId,
    pageLayoutId,
    recordFilters,
    recordFilterGroups,
  }: {
    workspaceId: string;
    pageLayoutId: string;
    recordFilters?: unknown[] | null;
    recordFilterGroups?: unknown[] | null;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const dashboardRepository =
        await this.globalWorkspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
          workspaceId,
          'dashboard',
          { shouldBypassPermissionChecks: true },
        );

      await dashboardRepository.update({ pageLayoutId }, {
        recordFilters: (recordFilters ?? null) as never,
        recordFilterGroups: (recordFilterGroups ?? null) as never,
      } as never);
    }, authContext);
  }

  private async findDashboardFilterStateByPageLayoutId({
    pageLayoutId,
    workspaceId,
  }: {
    pageLayoutId: string;
    workspaceId: string;
  }): Promise<PageLayoutDashboardFilterState | null> {
    const authContext = buildSystemAuthContext(workspaceId);
    let dashboardFilterState: PageLayoutDashboardFilterState | null = null;

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const dashboardRepository =
        await this.globalWorkspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
          workspaceId,
          'dashboard',
          { shouldBypassPermissionChecks: true },
        );

      const linkedDashboard = await dashboardRepository.findOne({
        where: {
          pageLayoutId,
        },
        select: ['recordFilters', 'recordFilterGroups'],
      });

      dashboardFilterState = {
        recordFilters: linkedDashboard?.recordFilters ?? null,
        recordFilterGroups: linkedDashboard?.recordFilterGroups ?? null,
      };
    }, authContext);

    return dashboardFilterState;
  }
}
