import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type DashboardFilterService } from 'src/modules/dashboard/services/dashboard-filter.service';

@Injectable()
export class DashboardAccessService {
  constructor(
    private readonly dashboardFilterService: Pick<
      DashboardFilterService,
      'findDashboardPresetById'
    >,
    private readonly permissionsService: Pick<
      PermissionsService,
      'userHasWorkspaceSettingPermission'
    >,
    private readonly userRoleService: Pick<
      UserRoleService,
      'getRolesByUserWorkspaces'
    >,
  ) {}

  async canCreatePreset({
    workspaceId,
    userWorkspaceId,
    apiKeyId,
    applicationId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
    apiKeyId?: string;
    applicationId?: string;
  }): Promise<boolean> {
    const hasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        workspaceId,
        userWorkspaceId,
        apiKeyId,
        applicationId,
        setting: PermissionFlagType.LAYOUTS,
      });

    if (!hasPermission) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`You do not have permission to create dashboard presets. Please contact your workspace administrator for access.`,
        },
      );
    }

    return true;
  }

  async canUpdatePreset({
    presetId,
    workspaceId,
    userId,
    userWorkspaceId,
    apiKeyId,
    applicationId,
  }: {
    presetId: string | null;
    workspaceId: string;
    userId?: string;
    userWorkspaceId?: string;
    apiKeyId?: string;
    applicationId?: string;
  }): Promise<boolean> {
    if (!presetId) {
      return true;
    }

    const preset = await this.dashboardFilterService.findDashboardPresetById({
      id: presetId,
      workspaceId,
    });

    if (!preset) {
      return true;
    }

    if (preset.createdBy.id === userId) {
      return true;
    }

    if (
      isDefined(userWorkspaceId) &&
      (await this.isWorkspaceAdmin({ userWorkspaceId, workspaceId }))
    ) {
      return true;
    }

    if (isDefined(apiKeyId) || isDefined(applicationId)) {
      return this.canCreatePreset({
        workspaceId,
        userWorkspaceId,
        apiKeyId,
        applicationId,
      });
    }

    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
      {
        userFriendlyMessage: msg`You do not have permission to rename this dashboard preset. Please contact your workspace administrator for access.`,
      },
    );
  }

  private async isWorkspaceAdmin({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const rolesByUserWorkspace =
      await this.userRoleService.getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspaceId],
        workspaceId,
      });
    const [role] = rolesByUserWorkspace.get(userWorkspaceId) ?? [];

    return role?.canUpdateAllSettings ?? false;
  }
}
