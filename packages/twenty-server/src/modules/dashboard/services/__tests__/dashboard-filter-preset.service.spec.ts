import { BadRequestException } from '@nestjs/common';

import {
  DashboardException,
  DashboardExceptionCode,
} from 'src/modules/dashboard/exceptions/dashboard.exception';
import { DashboardFilterPresetService } from 'src/modules/dashboard/services/dashboard-filter-preset.service';

describe('DashboardFilterPresetService', () => {
  it('AC-001: creates a preset with generated id and timestamps', async () => {
    const repository = {
      save: jest.fn().mockResolvedValue({
        id: 'preset-1',
        dashboardId: 'd7b64c9e-aedc-4e6e-9f8a-aa95b7d28b01',
        name: 'Open Opportunities',
        filters: {
          recordFilters: [],
          recordFilterGroups: [],
        },
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    };

    const dashboardExistenceChecker = {
      existsById: jest.fn().mockResolvedValue(true),
    };

    const service = new DashboardFilterPresetService(
      repository as never,
      dashboardExistenceChecker as never,
    );

    const result = await service.createPreset({
      dashboardId: 'd7b64c9e-aedc-4e6e-9f8a-aa95b7d28b01',
      name: 'Open Opportunities',
      filter: {
        recordFilters: [],
        recordFilterGroups: [],
      },
    });

    expect(dashboardExistenceChecker.existsById).toHaveBeenCalledWith(
      'd7b64c9e-aedc-4e6e-9f8a-aa95b7d28b01',
    );
    expect(repository.save).toHaveBeenCalledWith({
      dashboardId: 'd7b64c9e-aedc-4e6e-9f8a-aa95b7d28b01',
      name: 'Open Opportunities',
      filters: {
        recordFilters: [],
        recordFilterGroups: [],
      },
    });
    expect(result).toEqual({
      id: 'preset-1',
      dashboardId: 'd7b64c9e-aedc-4e6e-9f8a-aa95b7d28b01',
      name: 'Open Opportunities',
      filter: {
        recordFilters: [],
        recordFilterGroups: [],
      },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('AC-002: throws a BadRequestException for invalid filter structure', async () => {
    const service = new DashboardFilterPresetService(
      {
        save: jest.fn(),
      } as never,
      {
        existsById: jest.fn().mockResolvedValue(true),
      } as never,
    );

    await expect(
      service.createPreset({
        dashboardId: 'd7b64c9e-aedc-4e6e-9f8a-aa95b7d28b01',
        name: 'Invalid',
        filter: {
          invalid: true,
        },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('AC-003: throws dashboard not found when dashboardId does not exist', async () => {
    const service = new DashboardFilterPresetService(
      {
        save: jest.fn(),
      } as never,
      {
        existsById: jest.fn().mockResolvedValue(false),
      } as never,
    );

    await expect(
      service.createPreset({
        dashboardId: '11111111-1111-1111-1111-111111111111',
        name: 'Missing dashboard',
        filter: {
          recordFilters: [],
          recordFilterGroups: [],
        },
      }),
    ).rejects.toMatchObject<Partial<DashboardException>>({
      code: DashboardExceptionCode.DASHBOARD_NOT_FOUND,
      message:
        'Dashboard with ID "11111111-1111-1111-1111-111111111111" not found',
    });
  });
});
