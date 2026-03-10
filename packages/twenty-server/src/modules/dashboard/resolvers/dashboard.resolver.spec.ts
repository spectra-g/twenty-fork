import { BadRequestException } from '@nestjs/common';

import { CreateDashboardFilterPresetInput } from 'src/modules/dashboard/dtos/inputs/create-dashboard-filter-preset.input';
import { DashboardFilterPresetDTO } from 'src/modules/dashboard/dtos/dashboard-filter-preset.dto';
import { DashboardResolver } from 'src/modules/dashboard/resolvers/dashboard.resolver';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';
import { DashboardFilterPresetService } from 'src/modules/dashboard/services/dashboard-filter-preset.service';
import { DashboardService } from 'src/modules/dashboard/services/dashboard.service';

describe('DashboardResolver (outer acceptance)', () => {
  let resolver: DashboardResolver;

  const dashboardFilterPresetServiceMock = {
    createPreset: jest.fn(),
  };

  beforeEach(() => {
    resolver = new DashboardResolver(
      {} as DashboardDuplicationService,
      {
        getStubStatus: () => 'dashboard:stub:ok',
        getStubVersion: () => 'v0',
      } as DashboardService,
      dashboardFilterPresetServiceMock as DashboardFilterPresetService,
    );
    jest.clearAllMocks();
  });

  it('should expose stubbed dashboard status query', () => {
    expect(resolver.dashboardStubStatus()).toBe('dashboard:stub:ok');
  });

  it('should expose stubbed dashboard version query', () => {
    expect(resolver.dashboardStubVersion()).toBe('v0');
  });

  it('AC-001: createDashboardFilterPreset returns persisted preset payload', async () => {
    const input: CreateDashboardFilterPresetInput = {
      dashboardId: 'd7b64c9e-aedc-4e6e-9f8a-aa95b7d28b01',
      name: 'Open Opportunities',
      filter: {
        recordFilters: [],
        recordFilterGroups: [],
      },
    };

    const persisted: DashboardFilterPresetDTO = {
      id: '192da6f6-f5ba-4522-95ed-b938e0fc7d4b',
      dashboardId: input.dashboardId,
      name: input.name,
      filter: input.filter,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    dashboardFilterPresetServiceMock.createPreset.mockResolvedValue(persisted);

    await expect(
      resolver.createDashboardFilterPreset(input),
    ).resolves.toEqual(persisted);
  });

  it('AC-002: createDashboardFilterPreset rejects invalid filter structure', async () => {
    const input: CreateDashboardFilterPresetInput = {
      dashboardId: 'd7b64c9e-aedc-4e6e-9f8a-aa95b7d28b01',
      name: 'Invalid',
      filter: {
        invalid: true,
      } as unknown as CreateDashboardFilterPresetInput['filter'],
    };

    dashboardFilterPresetServiceMock.createPreset.mockRejectedValue(
      new BadRequestException('Invalid filter structure'),
    );

    await expect(resolver.createDashboardFilterPreset(input)).rejects.toThrow(
      'Invalid filter structure',
    );
  });

  it('AC-003: createDashboardFilterPreset rejects unknown dashboardId', async () => {
    const input: CreateDashboardFilterPresetInput = {
      dashboardId: '11111111-1111-1111-1111-111111111111',
      name: 'Missing dashboard',
      filter: {
        recordFilters: [],
        recordFilterGroups: [],
      },
    };

    dashboardFilterPresetServiceMock.createPreset.mockRejectedValue(
      new Error('Dashboard with ID "11111111-1111-1111-1111-111111111111" not found'),
    );

    await expect(resolver.createDashboardFilterPreset(input)).rejects.toThrow(
      'Dashboard with ID "11111111-1111-1111-1111-111111111111" not found',
    );
  });
});
