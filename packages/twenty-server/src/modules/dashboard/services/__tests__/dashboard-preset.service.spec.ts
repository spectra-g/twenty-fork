import { Test, type TestingModule } from '@nestjs/testing';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';

describe('DashboardPresetService', () => {
  let service: DashboardPresetService;

  const executeInWorkspaceContext = jest.fn();
  const getRepository = jest.fn();
  const insert = jest.fn();
  const findOne = jest.fn();
  const find = jest.fn();
  const update = jest.fn();

  const authContext = {
    workspace: { id: 'workspace-id' },
    user: { id: 'user-id' },
    workspaceMemberId: 'workspace-member-id',
    userWorkspaceId: 'user-workspace-id',
  } as AuthContext;

  beforeEach(async () => {
    jest.clearAllMocks();

    executeInWorkspaceContext.mockImplementation(async (callback) => {
      return callback();
    });
    getRepository.mockResolvedValue({
      insert,
      findOne,
      find,
      update,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardPresetService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext,
            getRepository,
          },
        },
      ],
    }).compile();

    service = module.get<DashboardPresetService>(DashboardPresetService);
  });

  it('should persist a preset and read back the saved record', async () => {
    const filterState = {
      recordFilters: [
        {
          fieldMetadataId: 'company-id',
          operand: 'contains',
          value: 'Acme',
        },
      ],
    };
    const savedRecord = {
      id: 'preset-id',
      name: 'My Preset',
      dashboardId: 'dashboard-id',
      createdByUserWorkspaceId: 'user-workspace-id',
      filterState,
      lastUsedAt: new Date('2026-03-30T10:00:00.000Z'),
    };

    insert.mockResolvedValue({ identifiers: [{ id: savedRecord.id }] });
    findOne.mockResolvedValue(savedRecord);

    const result = await service.savePreset(
      'dashboard-id',
      'My Preset',
      filterState,
      authContext,
    );

    expect(executeInWorkspaceContext).toHaveBeenCalledWith(
      expect.any(Function),
      authContext,
    );
    expect(getRepository).toHaveBeenCalledWith(
      'workspace-id',
      'dashboardPreset',
      { shouldBypassPermissionChecks: true },
    );
    expect(insert).toHaveBeenCalledWith({
      dashboardId: 'dashboard-id',
      name: 'My Preset',
      createdByUserWorkspaceId: 'user-workspace-id',
      filterState,
      lastUsedAt: expect.any(Date),
    });
    expect(findOne).toHaveBeenCalledWith({
      where: { id: savedRecord.id },
    });
    expect(result).toEqual({
      id: 'preset-id',
      name: 'My Preset',
      filterState,
      canEdit: true,
      lastUsedAt: '2026-03-30T10:00:00.000Z',
    });
  });

  it('should return presets for a dashboard ordered by most recently used', async () => {
    find.mockResolvedValue([
      {
        id: 'preset-c',
        name: 'Preset C',
        createdByUserWorkspaceId: 'user-workspace-id',
        filterState: { recordFilters: [] },
        lastUsedAt: new Date('2026-03-30T12:00:00.000Z'),
      },
      {
        id: 'preset-a',
        name: 'Preset A',
        createdByUserWorkspaceId: 'another-user-workspace-id',
        filterState: { recordFilters: [] },
        lastUsedAt: new Date('2026-03-30T11:00:00.000Z'),
      },
    ]);

    const result = await service.getPresetsForDashboard(
      'dashboard-id',
      authContext,
    );

    expect(find).toHaveBeenCalledWith({
      where: { dashboardId: 'dashboard-id' },
      order: { lastUsedAt: 'DESC' },
    });
    expect(result).toEqual([
      {
        id: 'preset-c',
        name: 'Preset C',
        filterState: { recordFilters: [] },
        canEdit: true,
        lastUsedAt: '2026-03-30T12:00:00.000Z',
      },
      {
        id: 'preset-a',
        name: 'Preset A',
        filterState: { recordFilters: [] },
        canEdit: false,
        lastUsedAt: '2026-03-30T11:00:00.000Z',
      },
    ]);
  });

  it('should touch a preset and return the updated record', async () => {
    const touchedAt = new Date('2026-03-30T13:00:00.000Z');

    findOne.mockResolvedValue({
      id: 'preset-id',
      name: 'Preset A',
      createdByUserWorkspaceId: null,
      filterState: { recordFilters: [] },
      lastUsedAt: touchedAt,
    });

    const result = await service.touchPreset('preset-id', authContext);

    expect(update).toHaveBeenCalledWith('preset-id', {
      lastUsedAt: expect.any(Date),
    });
    expect(findOne).toHaveBeenCalledWith({
      where: { id: 'preset-id' },
    });
    expect(result).toEqual({
      id: 'preset-id',
      name: 'Preset A',
      filterState: { recordFilters: [] },
      canEdit: false,
      lastUsedAt: '2026-03-30T13:00:00.000Z',
    });
  });

  it('should rename an owned preset', async () => {
    findOne
      .mockResolvedValueOnce({
        id: 'preset-id',
        name: 'Preset A',
        createdByUserWorkspaceId: 'user-workspace-id',
        filterState: { recordFilters: [] },
        lastUsedAt: new Date('2026-03-30T13:00:00.000Z'),
      })
      .mockResolvedValueOnce({
        id: 'preset-id',
        name: 'Renamed Preset',
        createdByUserWorkspaceId: 'user-workspace-id',
        filterState: { recordFilters: [] },
        lastUsedAt: new Date('2026-03-30T13:00:00.000Z'),
      });

    const result = await service.renamePreset(
      'preset-id',
      'Renamed Preset',
      authContext,
    );

    expect(update).toHaveBeenCalledWith('preset-id', {
      name: 'Renamed Preset',
    });
    expect(result).toEqual({
      id: 'preset-id',
      name: 'Renamed Preset',
      filterState: { recordFilters: [] },
      canEdit: true,
      lastUsedAt: '2026-03-30T13:00:00.000Z',
    });
  });

  it('should reject renaming a preset owned by another user', async () => {
    findOne.mockResolvedValue({
      id: 'preset-id',
      name: 'Preset A',
      createdByUserWorkspaceId: 'another-user-workspace-id',
      filterState: { recordFilters: [] },
      lastUsedAt: new Date('2026-03-30T13:00:00.000Z'),
    });

    await expect(
      service.renamePreset('preset-id', 'Renamed Preset', authContext),
    ).rejects.toThrow(ForbiddenError);

    expect(update).not.toHaveBeenCalled();
  });

  it('should delete an owned preset', async () => {
    findOne.mockResolvedValue({
      id: 'preset-id',
      name: 'Preset A',
      createdByUserWorkspaceId: 'user-workspace-id',
      filterState: { recordFilters: [] },
      lastUsedAt: new Date('2026-03-30T13:00:00.000Z'),
    });

    const deleteOne = jest.fn().mockResolvedValue(undefined);

    getRepository.mockResolvedValue({
      insert,
      findOne,
      find,
      update,
      delete: deleteOne,
    });

    await service.deletePreset('preset-id', authContext);

    expect(deleteOne).toHaveBeenCalledWith('preset-id');
  });
});
