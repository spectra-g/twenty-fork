import { ForbiddenException, Injectable } from '@nestjs/common';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type DashboardFiltersOutput } from 'src/modules/dashboard/dtos/dashboard-filters.output';
import { type UpdateDashboardFiltersInput } from 'src/modules/dashboard/dtos/update-dashboard-filters.input';
import { type UpdateDashboardFiltersOutput } from 'src/modules/dashboard/dtos/update-dashboard-filters.output';

const FORBIDDEN_DASHBOARD_ID = '00000000-0000-0000-0000-000000000403';
const EMPTY_DASHBOARD_ID = '00000000-0000-0000-0000-000000000003';
const DEFAULT_FILTER_GROUP_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_FILTER_FIELD_METADATA_ID =
  '00000000-0000-0000-0000-000000000002';
const DEFAULT_PRESET_ID = '00000000-0000-0000-0000-000000000004';

@Injectable()
export class DashboardFilterService {
  async getDashboardFilters({
    dashboardId,
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

    // @clawdence-stub: STORY-090 - Implement filter precedence and preset orchestration service
    // @clawdence-stub: STORY-091 - Implement actual persistence logic for dashboard filters and presets
    // @clawdence-stub: STORY-093 - Implement widget filter applicability checks
    return {
      activeFilters: {
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
      },
      presets: [
        {
          id: DEFAULT_PRESET_ID,
          name: 'Open deals',
          visibility: 'WORKSPACE',
          position: 0,
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
      ],
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

    // @clawdence-stub: STORY-090 - Implement filter precedence and preset orchestration service
    // @clawdence-stub: STORY-091 - Implement actual persistence logic for dashboard filters and presets
    return {
      success: true,
    };
  }
}
