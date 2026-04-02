import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { DashboardExceptionCode } from 'src/modules/dashboard/exceptions/dashboard.exception';
import { DashboardPresetEntity } from 'src/modules/dashboard/entities/dashboard-preset.entity';
import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';
import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

describe('DashboardPresetService', () => {
  let service: DashboardPresetService;
  let dashboardPresetRepository: jest.Mocked<Repository<DashboardPresetEntity>>;
  let getRepository: jest.Mock;
  let injectUpdatedBy: jest.Mock;

  const workspaceId = 'workspace-id';
  const dashboardId = 'dashboard-id';
  const presetId = 'preset-id';
  const filterState = {
    recordFilters: [
      {
        id: 'filter-id',
        fieldMetadataId: 'field-id',
        operand: 'is',
        value: 'OPEN',
      },
    ],
    recordFilterGroups: [],
  };

  const authContext: AuthContext = {
    workspace: {
      id: workspaceId,
    } as any,
    user: {
      id: 'user-id',
    } as any,
    workspaceMemberId: 'workspace-member-id',
    userWorkspaceId: 'user-workspace-id',
  };

  const dashboard = {
    id: dashboardId,
    title: 'Sales Dashboard',
    filterConfiguration: null,
  } as DashboardWorkspaceEntity;

  beforeEach(async () => {
    dashboardPresetRepository = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<DashboardPresetEntity>>;

    getRepository = jest.fn().mockResolvedValue({
      findOne: jest.fn().mockResolvedValue(dashboard),
      save: jest.fn().mockImplementation(async (value) => value),
    });

    injectUpdatedBy = jest
      .fn()
      .mockImplementation(async ({ records }) => records);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardPresetService,
        {
          provide: getRepositoryToken(DashboardPresetEntity),
          useValue: dashboardPresetRepository,
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn(async (callback) => callback()),
            getRepository,
          },
        },
        {
          provide: ActorFromAuthContextService,
          useValue: {
            injectUpdatedBy,
          },
        },
      ],
    }).compile();

    service = module.get(DashboardPresetService);
  });

  it('creates a preset for an existing dashboard', async () => {
    const createdAt = new Date('2026-04-02T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    dashboardPresetRepository.create.mockReturnValue({
      id: presetId,
      dashboardId,
      workspaceId,
      name: 'Q1 Sales View',
      filterState,
      createdAt,
      updatedAt,
    } as DashboardPresetEntity);
    dashboardPresetRepository.save.mockResolvedValue({
      id: presetId,
      dashboardId,
      workspaceId,
      name: 'Q1 Sales View',
      filterState,
      createdAt,
      updatedAt,
    } as DashboardPresetEntity);

    const result = await service.create({
      createDashboardPresetInput: {
        dashboardId,
        name: ' Q1 Sales View ',
        filterState,
      },
      authContext,
    });

    expect(dashboardPresetRepository.create).toHaveBeenCalledWith({
      dashboardId,
      workspaceId,
      name: 'Q1 Sales View',
      filterState,
    });
    expect(result).toMatchObject({
      id: presetId,
      dashboardId,
      name: 'Q1 Sales View',
      filterState,
    });
  });

  it('lists presets for a dashboard in updated order', async () => {
    dashboardPresetRepository.find.mockResolvedValue([
      {
        id: 'preset-2',
        dashboardId,
        workspaceId,
        name: 'Newest',
        filterState,
      },
      {
        id: 'preset-1',
        dashboardId,
        workspaceId,
        name: 'Oldest',
        filterState,
      },
    ] as DashboardPresetEntity[]);

    const result = await service.list({
      dashboardId,
      workspaceId,
    });

    expect(dashboardPresetRepository.find).toHaveBeenCalledWith({
      where: {
        dashboardId,
        workspaceId,
      },
      order: {
        updatedAt: 'DESC',
      },
    });
    expect(result).toHaveLength(2);
  });

  it('applies a preset to the target dashboard filter configuration', async () => {
    const dashboardRepository = {
      findOne: jest.fn().mockResolvedValue(dashboard),
      save: jest.fn().mockImplementation(async (value) => value),
    };

    getRepository.mockResolvedValue(dashboardRepository);
    dashboardPresetRepository.findOne.mockResolvedValue({
      id: presetId,
      dashboardId,
      workspaceId,
      name: 'Q1 Sales View',
      filterState,
      createdAt: new Date('2026-04-02T10:00:00.000Z'),
      updatedAt: new Date('2026-04-02T10:00:00.000Z'),
    } as DashboardPresetEntity);

    const result = await service.apply({
      applyDashboardPresetInput: {
        presetId,
        targetDashboardId: dashboardId,
      },
      authContext,
    });

    expect(injectUpdatedBy).toHaveBeenCalled();
    expect(dashboardRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: dashboardId,
        filterConfiguration: filterState,
      }),
    );
    expect(result).toEqual({
      dashboardId,
      filterConfiguration: filterState,
    });
  });

  it('throws when creating a preset for a missing dashboard', async () => {
    getRepository.mockResolvedValue({
      findOne: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.create({
        createDashboardPresetInput: {
          dashboardId,
          name: 'Q1 Sales View',
          filterState,
        },
        authContext,
      }),
    ).rejects.toMatchObject({
      code: DashboardExceptionCode.DASHBOARD_NOT_FOUND,
    });
  });

  it('throws when applying a preset that does not belong to the target dashboard', async () => {
    dashboardPresetRepository.findOne.mockResolvedValue({
      id: presetId,
      dashboardId: 'another-dashboard-id',
      workspaceId,
      name: 'Q1 Sales View',
      filterState,
      createdAt: new Date('2026-04-02T10:00:00.000Z'),
      updatedAt: new Date('2026-04-02T10:00:00.000Z'),
    } as DashboardPresetEntity);

    await expect(
      service.apply({
        applyDashboardPresetInput: {
          presetId,
          targetDashboardId: dashboardId,
        },
        authContext,
      }),
    ).rejects.toMatchObject({
      code: DashboardExceptionCode.DASHBOARD_PRESET_NOT_FOUND,
    });
  });
});
