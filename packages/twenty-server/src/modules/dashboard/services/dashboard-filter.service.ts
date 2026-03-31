import { Injectable } from '@nestjs/common';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import {
  type DashboardFiltersOutput,
  type DashboardFilterPresetCreatedByDTO,
  type DashboardFilterPresetDTO,
} from 'src/modules/dashboard/dtos/dashboard-filters.output';
import {
  type DashboardFilterDTO,
  type DashboardRecordFilterDTO,
  type DashboardRecordFilterGroupDTO,
} from 'src/modules/dashboard/dtos/dashboard-filter.dto';
import { type UpdateDashboardFiltersInput } from 'src/modules/dashboard/dtos/update-dashboard-filters.input';
import { type UpdateDashboardFiltersOutput } from 'src/modules/dashboard/dtos/update-dashboard-filters.output';

const EMPTY_DASHBOARD_ID = '00000000-0000-0000-0000-000000000003';
const DEFAULT_FILTER_GROUP_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_FILTER_FIELD_METADATA_ID = '00000000-0000-0000-0000-000000000002';
const DEFAULT_PRESET_ID = '00000000-0000-0000-0000-000000000004';
const SECONDARY_PRESET_ID = '00000000-0000-0000-0000-000000000005';
const HIDDEN_PRESET_ID = '00000000-0000-0000-0000-000000000006';
const DEFAULT_CREATOR_ID = '00000000-0000-0000-0000-000000000101';
const SECONDARY_CREATOR_ID = '00000000-0000-0000-0000-000000000102';

type DashboardPresetRecord = DashboardFilterPresetDTO & {
  dashboardId: string;
  workspaceId: string;
};

const DEFAULT_ACTIVE_FILTERS: DashboardFilterDTO = {
  recordFilters: [
    {
      fieldMetadataId: DEFAULT_FILTER_FIELD_METADATA_ID,
      operand: 'eq',
      value: 'open',
      type: 'TEXT',
      recordFilterGroupId: DEFAULT_FILTER_GROUP_ID,
      subFieldName: null,
    },
  ],
  recordFilterGroups: [
    {
      id: DEFAULT_FILTER_GROUP_ID,
      logicalOperator: 'AND',
      parentRecordFilterGroupId: null,
    },
  ],
};

const buildCreatedBy = ({
  id,
  name,
}: DashboardFilterPresetCreatedByDTO): DashboardFilterPresetCreatedByDTO => ({
  id,
  name,
});

const cloneDashboardPresetRecord = (
  preset: DashboardPresetRecord,
): DashboardPresetRecord => ({
  ...preset,
  createdBy: { ...preset.createdBy },
  filter: cloneDashboardFilters(preset.filter),
});

const cloneDashboardFilters = (
  filters: DashboardFilterDTO,
): DashboardFilterDTO => ({
  recordFilters: filters.recordFilters.map((recordFilter) => ({
    ...recordFilter,
  })),
  recordFilterGroups: filters.recordFilterGroups.map((recordFilterGroup) => ({
    ...recordFilterGroup,
  })),
});

const DASHBOARD_PRESET_RECORDS: DashboardPresetRecord[] = [
  {
    dashboardId: 'dashboard-id',
    workspaceId: 'workspace-id',
    id: DEFAULT_PRESET_ID,
    name: 'Open deals',
    visibility: 'WORKSPACE',
    position: 0,
    createdBy: buildCreatedBy({
      id: DEFAULT_CREATOR_ID,
      name: 'Alex Morgan',
    }),
    filter: {
      recordFilters: [
        {
          fieldMetadataId: DEFAULT_FILTER_FIELD_METADATA_ID,
          operand: 'eq',
          value: 'open',
          type: 'TEXT',
          recordFilterGroupId: null,
          subFieldName: null,
        },
      ],
      recordFilterGroups: [],
    },
  },
  {
    dashboardId: 'dashboard-id',
    workspaceId: 'workspace-id',
    id: SECONDARY_PRESET_ID,
    name: 'My pipeline',
    visibility: 'WORKSPACE',
    position: 1,
    createdBy: buildCreatedBy({
      id: SECONDARY_CREATOR_ID,
      name: 'Sam Taylor',
    }),
    filter: {
      recordFilters: [
        {
          fieldMetadataId: '00000000-0000-0000-0000-000000000102',
          operand: 'eq',
          value: 'qualified',
          type: 'TEXT',
          recordFilterGroupId: null,
          subFieldName: null,
        },
      ],
      recordFilterGroups: [],
    },
  },
  {
    dashboardId: 'dashboard-id',
    workspaceId: 'workspace-id',
    id: HIDDEN_PRESET_ID,
    name: 'Hidden draft',
    visibility: 'UNLISTED',
    position: 2,
    createdBy: buildCreatedBy({
      id: SECONDARY_CREATOR_ID,
      name: 'Sam Taylor',
    }),
    filter: {
      recordFilters: [],
      recordFilterGroups: [],
    },
  },
];

@Injectable()
export class DashboardFilterService {
  private readonly dashboardPresetRecords = DASHBOARD_PRESET_RECORDS.map(
    cloneDashboardPresetRecord,
  );

  constructor(
    private readonly permissionsService: Pick<
      PermissionsService,
      'userHasWorkspaceSettingPermission'
    >,
  ) {}

  computeEffectiveFilters({
    dashboardFilters,
    widgetFilters,
  }: {
    dashboardFilters: DashboardFilterDTO;
    widgetFilters: DashboardFilterDTO;
  }): DashboardFilterDTO {
    const dashboardFilterKeys = new Set(
      dashboardFilters.recordFilters.map((recordFilter) =>
        this.getRecordFilterKey(recordFilter),
      ),
    );

    const remainingWidgetFilters = widgetFilters.recordFilters.filter(
      (recordFilter) =>
        !dashboardFilterKeys.has(this.getRecordFilterKey(recordFilter)),
    );

    const effectiveRecordFilters = [
      ...dashboardFilters.recordFilters,
      ...remainingWidgetFilters,
    ];
    const effectiveRecordFilterGroups = this.mergeRecordFilterGroups({
      dashboardFilters,
      widgetFilters: {
        recordFilters: remainingWidgetFilters,
        recordFilterGroups: widgetFilters.recordFilterGroups,
      },
    });

    return {
      recordFilters: effectiveRecordFilters,
      recordFilterGroups: effectiveRecordFilterGroups,
    };
  }

  applyPresetToWidgetFilters({
    presetFilters,
    widgetFilters,
  }: {
    presetFilters: DashboardFilterDTO;
    widgetFilters: DashboardFilterDTO;
  }): DashboardFilterDTO {
    return this.computeEffectiveFilters({
      dashboardFilters: presetFilters,
      widgetFilters,
    });
  }

  async listSharedPresets({
    dashboardId,
    authContext,
  }: {
    dashboardId: string;
    authContext: AuthContext;
  }): Promise<DashboardFilterPresetDTO[]> {
    return this.dashboardPresetRecords
      .filter(
        (preset) =>
          preset.dashboardId === dashboardId &&
          preset.workspaceId === authContext.workspace.id &&
          preset.visibility === 'WORKSPACE',
      )
      .map(
        ({
          dashboardId: _dashboardId,
          workspaceId: _workspaceId,
          ...preset
        }) => ({
          ...preset,
          createdBy: { ...preset.createdBy },
          filter: cloneDashboardFilters(preset.filter),
        }),
      );
  }

  async getDashboardFilters({
    dashboardId,
    authContext,
  }: {
    dashboardId: string;
    authContext: AuthContext;
  }): Promise<DashboardFiltersOutput> {
    await this.assertCanAccessDashboardFilters({
      authContext,
      userFriendlyMessage: msg`You do not have permission to access dashboard filters. Please contact your workspace administrator for access.`,
    });

    if (dashboardId === EMPTY_DASHBOARD_ID) {
      // @clawdence-stub: STORY-091 - Implement actual persistence logic for dashboard filters and presets
      return {
        activeFilters: {
          recordFilters: [],
          recordFilterGroups: [],
        },
        presets: [],
      };
    }

    // @clawdence-stub: STORY-091 - Implement actual persistence logic for dashboard filters and presets
    return {
      activeFilters: cloneDashboardFilters(DEFAULT_ACTIVE_FILTERS),
      presets: await this.listSharedPresets({ dashboardId, authContext }),
    };
  }

  async createDashboardPreset({
    input,
    authContext,
  }: {
    input: {
      dashboardId: string;
      name: string;
      visibility: string;
      filter: DashboardFilterDTO;
    };
    authContext: AuthContext;
  }): Promise<DashboardFilterPresetDTO> {
    await this.assertCanAccessDashboardFilters({
      authContext,
      userFriendlyMessage: msg`You do not have permission to create dashboard presets. Please contact your workspace administrator for access.`,
    });

    const nextPosition = this.dashboardPresetRecords.filter(
      (preset) =>
        preset.dashboardId === input.dashboardId &&
        preset.workspaceId === authContext.workspace.id,
    ).length;
    const newPresetRecord: DashboardPresetRecord = {
      dashboardId: input.dashboardId,
      workspaceId: authContext.workspace.id,
      id: `00000000-0000-0000-0000-${String(1000 + nextPosition).padStart(12, '0')}`,
      name: input.name,
      visibility: input.visibility,
      position: nextPosition,
      createdBy: buildCreatedBy({
        id: authContext.user?.id ?? DEFAULT_CREATOR_ID,
        name: 'Current User',
      }),
      filter: cloneDashboardFilters(input.filter),
    };

    this.dashboardPresetRecords.push(newPresetRecord);

    const {
      dashboardId: _dashboardId,
      workspaceId: _workspaceId,
      ...preset
    } = newPresetRecord;

    return cloneDashboardPresetRecord({
      ...preset,
      dashboardId: input.dashboardId,
      workspaceId: authContext.workspace.id,
    });
  }

  async renameDashboardPreset({
    id,
    name,
    authContext,
  }: {
    id: string;
    name: string;
    authContext: AuthContext;
  }): Promise<DashboardFilterPresetDTO> {
    const presetRecord = this.dashboardPresetRecords.find(
      (preset) =>
        preset.id === id && preset.workspaceId === authContext.workspace.id,
    );

    if (presetRecord?.createdBy.id !== authContext.user?.id) {
      await this.assertCanAccessDashboardFilters({
        authContext,
        userFriendlyMessage: msg`You do not have permission to rename this dashboard preset. Please contact your workspace administrator for access.`,
      });
    }

    if (presetRecord) {
      presetRecord.name = name;
    }

    const {
      dashboardId: _dashboardId,
      workspaceId: _workspaceId,
      ...preset
    } = presetRecord ?? {
      dashboardId: '',
      workspaceId: '',
      id,
      name,
      visibility: 'WORKSPACE',
      position: 0,
      createdBy: buildCreatedBy({
        id: authContext.user?.id ?? DEFAULT_CREATOR_ID,
        name: 'Current User',
      }),
      filter: cloneDashboardFilters({
        recordFilters: [],
        recordFilterGroups: [],
      }),
    };

    return {
      ...preset,
      createdBy: { ...preset.createdBy },
      filter: cloneDashboardFilters(preset.filter),
    };
  }

  async updateDashboardFilters({
    input,
    authContext,
  }: {
    input: UpdateDashboardFiltersInput;
    authContext: AuthContext;
  }): Promise<UpdateDashboardFiltersOutput> {
    await this.assertCanAccessDashboardFilters({
      authContext,
      userFriendlyMessage: msg`You do not have permission to update dashboard filters. Please contact your workspace administrator for access.`,
    });

    // @clawdence-stub: STORY-091 - Implement actual persistence logic for dashboard filters and presets
    this.computeEffectiveFilters({
      dashboardFilters: this.normalizeDashboardFilters(input.activeFilters),
      widgetFilters: {
        recordFilters: [],
        recordFilterGroups: [],
      },
    });

    return {
      success: true,
    };
  }

  private normalizeDashboardFilters(
    filters: DashboardFilterDTO,
  ): DashboardFilterDTO {
    const deduplicatedRecordFilters = Array.from(
      new Map(
        filters.recordFilters.map((recordFilter) => [
          this.getRecordFilterKey(recordFilter),
          recordFilter,
        ]),
      ).values(),
    );
    const referencedGroupIds = new Set(
      deduplicatedRecordFilters
        .map((recordFilter) => recordFilter.recordFilterGroupId)
        .filter(
          (recordFilterGroupId): recordFilterGroupId is string =>
            recordFilterGroupId !== null && recordFilterGroupId !== undefined,
        ),
    );

    return {
      recordFilters: deduplicatedRecordFilters,
      recordFilterGroups: this.getReferencedRecordFilterGroups({
        recordFilterGroups: filters.recordFilterGroups,
        referencedGroupIds,
      }),
    };
  }

  private mergeRecordFilterGroups({
    dashboardFilters,
    widgetFilters,
  }: {
    dashboardFilters: DashboardFilterDTO;
    widgetFilters: DashboardFilterDTO;
  }): DashboardRecordFilterGroupDTO[] {
    const referencedGroupIds = new Set(
      [...dashboardFilters.recordFilters, ...widgetFilters.recordFilters]
        .map((recordFilter) => recordFilter.recordFilterGroupId)
        .filter(
          (recordFilterGroupId): recordFilterGroupId is string =>
            recordFilterGroupId !== null && recordFilterGroupId !== undefined,
        ),
    );

    return Array.from(
      new Map(
        this.getReferencedRecordFilterGroups({
          recordFilterGroups: [
            ...dashboardFilters.recordFilterGroups,
            ...widgetFilters.recordFilterGroups,
          ],
          referencedGroupIds,
        }).map((recordFilterGroup) => [
          recordFilterGroup.id,
          recordFilterGroup,
        ]),
      ).values(),
    );
  }

  private getRecordFilterKey(recordFilter: DashboardRecordFilterDTO): string {
    return `${recordFilter.fieldMetadataId}:${recordFilter.subFieldName ?? ''}`;
  }

  private getReferencedRecordFilterGroups({
    recordFilterGroups,
    referencedGroupIds,
  }: {
    recordFilterGroups: DashboardRecordFilterGroupDTO[];
    referencedGroupIds: Set<string>;
  }): DashboardRecordFilterGroupDTO[] {
    const recordFilterGroupById = new Map(
      recordFilterGroups.map((recordFilterGroup) => [
        recordFilterGroup.id,
        recordFilterGroup,
      ]),
    );
    const requiredGroupIds = new Set(referencedGroupIds);

    for (const referencedGroupId of referencedGroupIds) {
      let currentGroup = recordFilterGroupById.get(referencedGroupId);

      while (currentGroup?.parentRecordFilterGroupId) {
        requiredGroupIds.add(currentGroup.parentRecordFilterGroupId);
        currentGroup = recordFilterGroupById.get(
          currentGroup.parentRecordFilterGroupId,
        );
      }
    }

    return recordFilterGroups.filter((recordFilterGroup) =>
      requiredGroupIds.has(recordFilterGroup.id),
    );
  }

  private async assertCanAccessDashboardFilters({
    authContext,
    userFriendlyMessage,
  }: {
    authContext: AuthContext;
    userFriendlyMessage?: MessageDescriptor;
  }): Promise<void> {
    const hasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId: authContext.userWorkspaceId,
        workspaceId: authContext.workspace.id,
        setting: PermissionFlagType.LAYOUTS,
        apiKeyId: authContext.apiKey?.id,
        applicationId: authContext.application?.id,
      });

    if (!hasPermission) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        { userFriendlyMessage },
      );
    }
  }
}
