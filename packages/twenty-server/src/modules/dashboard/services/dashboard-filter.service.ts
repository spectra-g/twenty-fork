import { ForbiddenException, Injectable } from '@nestjs/common';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
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

const FORBIDDEN_DASHBOARD_ID = '00000000-0000-0000-0000-000000000403';
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
    return DASHBOARD_PRESET_RECORDS.filter(
      (preset) =>
        preset.dashboardId === dashboardId &&
        preset.workspaceId === authContext.workspace.id &&
        preset.visibility === 'WORKSPACE',
    ).map(
      ({ dashboardId: _dashboardId, workspaceId: _workspaceId, ...preset }) =>
        preset,
    );
  }

  async getDashboardFilters({
    dashboardId,
    authContext,
  }: {
    dashboardId: string;
    authContext: AuthContext;
  }): Promise<DashboardFiltersOutput> {
    if (dashboardId === FORBIDDEN_DASHBOARD_ID) {
      // @clawdence-stub: STORY-092 - Implement full dashboard filter permission checks
      throw new ForbiddenException('Dashboard filters are not accessible');
    }

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
      activeFilters: DEFAULT_ACTIVE_FILTERS,
      presets: await this.listSharedPresets({ dashboardId, authContext }),
    };
  }

  async updateDashboardFilters({
    input,
  }: {
    input: UpdateDashboardFiltersInput;
    authContext: AuthContext;
  }): Promise<UpdateDashboardFiltersOutput> {
    if (input.dashboardId === FORBIDDEN_DASHBOARD_ID) {
      // @clawdence-stub: STORY-092 - Implement full dashboard filter permission checks
      throw new ForbiddenException('Dashboard filters are not accessible');
    }

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
      recordFilterGroups: filters.recordFilterGroups.filter(
        (recordFilterGroup) => referencedGroupIds.has(recordFilterGroup.id),
      ),
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
        [
          ...dashboardFilters.recordFilterGroups,
          ...widgetFilters.recordFilterGroups,
        ]
          .filter((recordFilterGroup) =>
            referencedGroupIds.has(recordFilterGroup.id),
          )
          .map((recordFilterGroup) => [
            recordFilterGroup.id,
            recordFilterGroup,
          ]),
      ).values(),
    );
  }

  private getRecordFilterKey(recordFilter: DashboardRecordFilterDTO): string {
    return `${recordFilter.fieldMetadataId}:${recordFilter.subFieldName ?? ''}`;
  }
}
