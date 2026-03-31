import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type UpdateDashboardFiltersInput } from 'src/modules/dashboard/dtos/update-dashboard-filters.input';
import { DashboardFilterService } from 'src/modules/dashboard/services/dashboard-filter.service';

import { DashboardResolver } from './dashboard.resolver';

describe('DashboardResolver', () => {
  let resolver: DashboardResolver;
  let dashboardFilterService: DashboardFilterService;

  const workspace = { id: 'workspace-id' } as WorkspaceEntity;
  const user = { id: 'user-id' } as UserEntity;
  const workspaceMemberId = 'workspace-member-id';
  const userWorkspaceId = 'user-workspace-id';
  const authContext: AuthContext = {
    workspace,
    user,
    workspaceMemberId,
    userWorkspaceId,
  };

  beforeEach(() => {
    dashboardFilterService = new DashboardFilterService();
    resolver = new DashboardResolver({} as never, dashboardFilterService);
  });

  it('returns active filters and presets for a dashboard', async () => {
    const getDashboardFiltersSpy = jest.spyOn(
      dashboardFilterService,
      'getDashboardFilters',
    );

    const result = await resolver.getDashboardFilters(
      'dashboard-id',
      workspace,
      user,
      workspaceMemberId,
      userWorkspaceId,
    );

    expect(getDashboardFiltersSpy).toHaveBeenCalledWith({
      dashboardId: 'dashboard-id',
      authContext,
    });
    expect(result).toEqual({
      activeFilters: {
        recordFilters: [
          {
            fieldMetadataId: '00000000-0000-0000-0000-000000000002',
            operand: 'eq',
            value: 'open',
            type: 'TEXT',
            recordFilterGroupId: '00000000-0000-0000-0000-000000000001',
            subFieldName: null,
          },
        ],
        recordFilterGroups: [
          {
            id: '00000000-0000-0000-0000-000000000001',
            logicalOperator: 'AND',
            parentRecordFilterGroupId: null,
          },
        ],
      },
      presets: [
        {
          id: '00000000-0000-0000-0000-000000000004',
          name: 'Open deals',
          visibility: 'WORKSPACE',
          position: 0,
          createdBy: {
            id: '00000000-0000-0000-0000-000000000101',
            name: 'Alex Morgan',
          },
          filter: {
            recordFilters: [
              {
                fieldMetadataId: '00000000-0000-0000-0000-000000000002',
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
          id: '00000000-0000-0000-0000-000000000005',
          name: 'My pipeline',
          visibility: 'WORKSPACE',
          position: 1,
          createdBy: {
            id: '00000000-0000-0000-0000-000000000102',
            name: 'Sam Taylor',
          },
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
      ],
    });
  });

  it('returns empty filter arrays when a dashboard has no saved filters', async () => {
    const result = await resolver.getDashboardFilters(
      '00000000-0000-0000-0000-000000000003',
      workspace,
      user,
      workspaceMemberId,
      userWorkspaceId,
    );

    expect(result).toEqual({
      activeFilters: {
        recordFilters: [],
        recordFilterGroups: [],
      },
      presets: [],
    });
  });

  it('updates dashboard filters and returns a success flag', async () => {
    const input: UpdateDashboardFiltersInput = {
      dashboardId: 'dashboard-id',
      activeFilters: {
        recordFilters: [
          {
            fieldMetadataId: 'field-metadata-id',
            operand: 'eq',
            value: 'open',
            type: 'TEXT',
            recordFilterGroupId: null,
            subFieldName: null,
          },
        ],
        recordFilterGroups: [],
      },
    };

    const updateDashboardFiltersSpy = jest.spyOn(
      dashboardFilterService,
      'updateDashboardFilters',
    );

    const result = await resolver.updateDashboardFilters(
      input,
      workspace,
      user,
      workspaceMemberId,
      userWorkspaceId,
    );

    expect(updateDashboardFiltersSpy).toHaveBeenCalledWith({
      input,
      authContext,
    });
    expect(result).toEqual({ success: true });
  });

  it('propagates authorization failures when dashboard filters are not accessible', async () => {
    await expect(
      resolver.getDashboardFilters(
        '00000000-0000-0000-0000-000000000403',
        workspace,
        user,
        workspaceMemberId,
        userWorkspaceId,
      ),
    ).rejects.toThrow('Dashboard filters are not accessible');
  });
});
