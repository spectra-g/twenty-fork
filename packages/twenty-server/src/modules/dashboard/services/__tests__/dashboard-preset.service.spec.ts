/* eslint-disable @nx/enforce-module-boundaries */
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import type { Repository } from 'typeorm';

import type { DashboardPresetEntity } from 'src/engine/metadata-modules/dashboard-preset/entities/dashboard-preset.entity';
import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';

describe('DashboardPresetService', () => {
  const dashboardId = 'b1e6c8cb-dbe6-4784-af76-a244f83552df';
  const createdAt = new Date('2026-04-07T10:00:00.000Z');
  const updatedAt = new Date('2026-04-07T10:05:00.000Z');
  const filter = {
    recordFilters: [
      {
        fieldMetadataId: 'status-field-id',
        operand: ViewFilterOperand.IS,
        type: FieldMetadataType.SELECT,
        value: 'OPEN',
      },
    ],
    recordFilterGroups: [],
  };

  const buildEntity = (
    overrides: Partial<DashboardPresetEntity> = {},
  ): DashboardPresetEntity => ({
    id: 'preset-id',
    dashboardId,
    name: 'Open deals',
    filter,
    createdAt,
    updatedAt,
    deletedAt: null,
    ...overrides,
  });

  const createRepository = () =>
    ({
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    }) as unknown as jest.Mocked<Repository<DashboardPresetEntity>>;

  type SoftDeleteResult = Awaited<
    ReturnType<Repository<DashboardPresetEntity>['softDelete']>
  >;

  it('should persist a preset and return an isolated DTO copy', async () => {
    const repository = createRepository();
    const service = new DashboardPresetService(repository);
    const entity = buildEntity();

    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValue(entity);
    repository.save.mockResolvedValue(entity);
    repository.find.mockResolvedValue([entity]);

    const createdPreset = await service.createPreset({
      dashboardId,
      name: 'Open deals',
      filter,
    });

    createdPreset.name = 'Mutated outside the service';
    createdPreset.filter.recordFilters = [];

    expect(repository.create).toHaveBeenCalledWith({
      dashboardId,
      name: 'Open deals',
      filter,
    });
    expect(createdPreset.id).toBe('preset-id');

    const listedPresets =
      await service.findAllPresetsByDashboardId(dashboardId);

    expect(listedPresets).toEqual([
      expect.objectContaining({
        id: 'preset-id',
        name: 'Open deals',
        filter,
      }),
    ]);
  });

  it('should return persisted presets for a dashboard', async () => {
    const repository = createRepository();
    const service = new DashboardPresetService(repository);

    repository.find.mockResolvedValue([
      buildEntity(),
      buildEntity({
        id: 'preset-id-2',
        name: 'Won deals',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'status-field-id',
              operand: ViewFilterOperand.IS,
              type: FieldMetadataType.SELECT,
              value: 'WON',
            },
          ],
          recordFilterGroups: [],
        },
      }),
    ]);

    const presets = await service.findAllPresetsByDashboardId(dashboardId);

    expect(repository.find).toHaveBeenCalledWith({
      where: expect.objectContaining({
        dashboardId,
      }),
      order: {
        createdAt: 'ASC',
      },
    });
    expect(presets).toEqual([
      expect.objectContaining({
        id: 'preset-id',
        name: 'Open deals',
      }),
      expect.objectContaining({
        id: 'preset-id-2',
        name: 'Won deals',
      }),
    ]);
  });

  it('should return a preset by id and throw when it is missing', async () => {
    const repository = createRepository();
    const service = new DashboardPresetService(repository);
    const existingPreset = buildEntity();

    repository.findOne
      .mockResolvedValueOnce(existingPreset)
      .mockResolvedValueOnce(null);

    await expect(service.findPresetById(existingPreset.id)).resolves.toEqual(
      expect.objectContaining({
        id: existingPreset.id,
        name: existingPreset.name,
        dashboardId: existingPreset.dashboardId,
        filter: existingPreset.filter,
      }),
    );

    await expect(service.findPresetById('missing-id')).rejects.toThrow(
      'Dashboard preset missing-id not found',
    );
  });

  it('should reject duplicate names on create', async () => {
    const repository = createRepository();
    const service = new DashboardPresetService(repository);

    repository.findOne.mockResolvedValue(buildEntity());

    await expect(
      service.createPreset({
        dashboardId,
        name: 'Open deals',
        filter,
      }),
    ).rejects.toThrow(
      `Dashboard preset "Open deals" already exists for dashboard ${dashboardId}`,
    );
  });

  it('should update an existing preset and reject duplicate rename attempts', async () => {
    const repository = createRepository();
    const service = new DashboardPresetService(repository);
    const existingPreset = buildEntity();
    const conflictingPreset = buildEntity({
      id: 'preset-id-2',
      name: 'Won deals',
    });
    const savedPreset = buildEntity({
      id: existingPreset.id,
      name: 'Closed deals',
      filter: {
        recordFilters: [
          {
            fieldMetadataId: 'status-field-id',
            operand: ViewFilterOperand.IS,
            type: FieldMetadataType.SELECT,
            value: 'CLOSED',
          },
        ],
        recordFilterGroups: [],
      },
    });

    repository.findOne
      .mockResolvedValueOnce(existingPreset)
      .mockResolvedValueOnce(null);
    repository.save.mockResolvedValue(savedPreset);

    const updatedPreset = await service.updatePreset({
      id: existingPreset.id,
      name: 'Closed deals',
      filter: savedPreset.filter,
    });

    expect(updatedPreset).toEqual(
      expect.objectContaining({
        id: existingPreset.id,
        name: 'Closed deals',
        filter: savedPreset.filter,
      }),
    );

    repository.findOne.mockReset();
    repository.findOne
      .mockResolvedValueOnce(existingPreset)
      .mockResolvedValueOnce(conflictingPreset);

    await expect(
      service.updatePreset({
        id: existingPreset.id,
        name: 'Won deals',
      }),
    ).rejects.toThrow(
      `Dashboard preset "Won deals" already exists for dashboard ${dashboardId}`,
    );
  });

  it('should throw when updating a missing preset', async () => {
    const repository = createRepository();
    const service = new DashboardPresetService(repository);

    repository.findOne.mockResolvedValue(null);

    await expect(
      service.updatePreset({
        id: 'missing-id',
        name: 'Closed deals',
      }),
    ).rejects.toThrow('Dashboard preset missing-id not found');
  });

  it('should soft delete presets and report whether anything was deleted', async () => {
    const repository = createRepository();
    const service = new DashboardPresetService(repository);

    repository.softDelete
      .mockResolvedValueOnce({ affected: 1 } as SoftDeleteResult)
      .mockResolvedValueOnce({ affected: 0 } as SoftDeleteResult);

    await expect(service.deletePreset('preset-id')).resolves.toBe(true);
    await expect(service.deletePreset('missing-id')).resolves.toBe(false);
  });
});
