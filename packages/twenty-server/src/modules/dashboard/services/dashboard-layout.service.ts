import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  DashboardException,
  DashboardExceptionCode,
  DashboardExceptionMessageKey,
  generateDashboardExceptionMessage,
} from 'src/modules/dashboard/exceptions/dashboard.exception';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

@Injectable()
export class DashboardLayoutService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly pageLayoutService: PageLayoutService,
  ) {}

  async getDashboardLayoutByUrl({
    dashboardId,
    presetId,
    workspaceId,
  }: {
    dashboardId: string;
    presetId?: string;
    workspaceId: string;
  }): Promise<PageLayoutDTO> {
    const dashboardRepository =
      await this.globalWorkspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
        workspaceId,
        'dashboard',
        { shouldBypassPermissionChecks: true },
      );

    const dashboard = await dashboardRepository.findOne({
      where: { id: dashboardId },
    });

    if (!isDefined(dashboard)) {
      throw new DashboardException(
        generateDashboardExceptionMessage(
          DashboardExceptionMessageKey.DASHBOARD_NOT_FOUND,
          dashboardId,
        ),
        DashboardExceptionCode.DASHBOARD_NOT_FOUND,
      );
    }

    if (!isDefined(dashboard.pageLayoutId)) {
      throw new DashboardException(
        generateDashboardExceptionMessage(
          DashboardExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          dashboardId,
        ),
        DashboardExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    const pageLayout = await this.pageLayoutService.findByIdOrThrow({
      id: dashboard.pageLayoutId,
      workspaceId,
    });

    const normalizedPresetId = presetId?.trim();

    if (!isDefined(normalizedPresetId) || normalizedPresetId === '') {
      return {
        ...pageLayout,
        activePresetFilterState: null,
      };
    }

    try {
      const preset = await this.pageLayoutService.getPresetById({
        presetId: normalizedPresetId,
        pageLayoutId: dashboard.pageLayoutId,
        workspaceId,
      });

      return {
        ...pageLayout,
        activePresetFilterState: preset.filterState,
      };
    } catch (error) {
      if (
        error instanceof PageLayoutException &&
        error.code === PageLayoutExceptionCode.DASHBOARD_PRESET_NOT_FOUND
      ) {
        return {
          ...pageLayout,
          activePresetFilterState: null,
        };
      }

      throw error;
    }
  }
}
