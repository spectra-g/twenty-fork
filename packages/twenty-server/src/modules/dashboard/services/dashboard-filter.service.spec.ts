import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  type PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { DashboardFilterService } from 'src/modules/dashboard/services/dashboard-filter.service';

describe('DashboardFilterService', () => {
  let service: DashboardFilterService;
  let mockPermissionsService: {
    userHasWorkspaceSettingPermission: jest.Mock;
  };

  const authContext = {
    workspace: { id: 'workspace-id' },
    user: { id: 'user-id' },
    workspaceMemberId: 'workspace-member-id',
    userWorkspaceId: 'user-workspace-id',
  } as AuthContext;

  beforeEach(() => {
    mockPermissionsService = {
      userHasWorkspaceSettingPermission: jest.fn().mockResolvedValue(true),
    };

    const DashboardFilterServiceConstructor =
      DashboardFilterService as unknown as new (dependencies: {
        userHasWorkspaceSettingPermission: jest.Mock;
      }) => DashboardFilterService;

    service = new DashboardFilterServiceConstructor(mockPermissionsService);
  });

  describe('computeEffectiveFilters', () => {
    it('should override widget-local filters when dashboard-global filters conflict on the same field', () => {
      const result = service.computeEffectiveFilters({
        dashboardFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'owner-field',
              operand: 'eq',
              value: 'Alice',
              type: 'TEXT',
              recordFilterGroupId: null,
              subFieldName: null,
            },
          ],
          recordFilterGroups: [],
        },
        widgetFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'owner-field',
              operand: 'eq',
              value: 'Bob',
              type: 'TEXT',
              recordFilterGroupId: null,
              subFieldName: null,
            },
          ],
          recordFilterGroups: [],
        },
      });

      expect(result.recordFilters).toEqual([
        expect.objectContaining({
          fieldMetadataId: 'owner-field',
          value: 'Alice',
        }),
      ]);
      expect(result.recordFilters).not.toContainEqual(
        expect.objectContaining({
          fieldMetadataId: 'owner-field',
          value: 'Bob',
        }),
      );
    });

    it('should include both dashboard and widget filters when they target different fields', () => {
      const result = service.computeEffectiveFilters({
        dashboardFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'owner-field',
              operand: 'eq',
              value: 'Alice',
              type: 'TEXT',
              recordFilterGroupId: null,
              subFieldName: null,
            },
          ],
          recordFilterGroups: [],
        },
        widgetFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'stage-field',
              operand: 'eq',
              value: 'Open',
              type: 'TEXT',
              recordFilterGroupId: null,
              subFieldName: null,
            },
          ],
          recordFilterGroups: [],
        },
      });

      expect(result.recordFilters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fieldMetadataId: 'owner-field',
            value: 'Alice',
          }),
          expect.objectContaining({
            fieldMetadataId: 'stage-field',
            value: 'Open',
          }),
        ]),
      );
    });

    it('should retain parent filter groups when a referenced child group is nested', () => {
      const result = service.computeEffectiveFilters({
        dashboardFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'owner-field',
              operand: 'eq',
              value: 'Alice',
              type: 'TEXT',
              recordFilterGroupId: 'child-group',
              subFieldName: null,
            },
          ],
          recordFilterGroups: [
            {
              id: 'parent-group',
              logicalOperator: 'AND',
              parentRecordFilterGroupId: null,
            },
            {
              id: 'child-group',
              logicalOperator: 'OR',
              parentRecordFilterGroupId: 'parent-group',
            },
          ],
        },
        widgetFilters: {
          recordFilters: [],
          recordFilterGroups: [],
        },
      });

      expect(result.recordFilterGroups).toEqual([
        {
          id: 'parent-group',
          logicalOperator: 'AND',
          parentRecordFilterGroupId: null,
        },
        {
          id: 'child-group',
          logicalOperator: 'OR',
          parentRecordFilterGroupId: 'parent-group',
        },
      ]);
    });
  });

  describe('applyPresetToWidgetFilters', () => {
    it('should merge preset filters with widget-local filters using the same precedence rules', () => {
      const result = service.applyPresetToWidgetFilters({
        presetFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'owner-field',
              operand: 'eq',
              value: 'Team',
              type: 'TEXT',
              recordFilterGroupId: null,
              subFieldName: null,
            },
          ],
          recordFilterGroups: [],
        },
        widgetFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'stage-field',
              operand: 'eq',
              value: 'Open',
              type: 'TEXT',
              recordFilterGroupId: null,
              subFieldName: null,
            },
          ],
          recordFilterGroups: [],
        },
      });

      expect(result.recordFilters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fieldMetadataId: 'owner-field',
            value: 'Team',
          }),
          expect.objectContaining({
            fieldMetadataId: 'stage-field',
            value: 'Open',
          }),
        ]),
      );
    });
  });

  describe('listSharedPresets', () => {
    it('should return workspace-visible presets with creator metadata', async () => {
      const presets = await service.listSharedPresets({
        dashboardId: 'dashboard-id',
        authContext,
      });

      expect(presets).toHaveLength(2);
      expect(presets).toEqual([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          visibility: 'WORKSPACE',
          createdBy: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        }),
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          visibility: 'WORKSPACE',
          createdBy: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      ]);
    });
  });

  describe('getDashboardFilters', () => {
    it('should deny access when the user does not have layouts permission', async () => {
      mockPermissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        false,
      );

      await expect(
        service.getDashboardFilters({
          dashboardId: 'dashboard-id',
          authContext,
        }),
      ).rejects.toMatchObject<Partial<PermissionsException>>({
        code: PermissionsExceptionCode.PERMISSION_DENIED,
        message: 'Entity performing the request does not have permission',
      });

      expect(
        mockPermissionsService.userHasWorkspaceSettingPermission,
      ).toHaveBeenCalledWith({
        userWorkspaceId: authContext.userWorkspaceId,
        workspaceId: authContext.workspace.id,
        setting: 'LAYOUTS',
      });
    });
  });

  describe('updateDashboardFilters', () => {
    it('should deny updates when the user does not have layouts permission', async () => {
      mockPermissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        false,
      );

      await expect(
        service.updateDashboardFilters({
          input: {
            dashboardId: 'dashboard-id',
            activeFilters: {
              recordFilters: [],
              recordFilterGroups: [],
            },
          },
          authContext,
        }),
      ).rejects.toMatchObject<Partial<PermissionsException>>({
        code: PermissionsExceptionCode.PERMISSION_DENIED,
        message: 'Entity performing the request does not have permission',
      });

      expect(
        mockPermissionsService.userHasWorkspaceSettingPermission,
      ).toHaveBeenCalledWith({
        userWorkspaceId: authContext.userWorkspaceId,
        workspaceId: authContext.workspace.id,
        setting: 'LAYOUTS',
      });
    });

    it('should validate the active filters through the orchestration path before reporting success', async () => {
      await expect(
        service.updateDashboardFilters({
          input: {
            dashboardId: 'dashboard-id',
            activeFilters: {
              recordFilters: [
                {
                  fieldMetadataId: 'owner-field',
                  operand: 'eq',
                  value: 'Alice',
                  type: 'TEXT',
                  recordFilterGroupId: null,
                  subFieldName: null,
                },
              ],
              recordFilterGroups: [],
            },
          },
          authContext,
        }),
      ).resolves.toEqual({ success: true });
    });
  });
});
