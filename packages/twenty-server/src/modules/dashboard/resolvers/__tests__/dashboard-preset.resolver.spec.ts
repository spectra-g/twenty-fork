import { type ArgumentMetadata } from '@nestjs/common';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { DashboardPresetController } from 'src/modules/dashboard/controllers/dashboard-preset.controller';
import { SaveDashboardPresetInput } from 'src/modules/dashboard/dtos/save-dashboard-preset.input';
import { DashboardPresetResolver } from 'src/modules/dashboard/resolvers/dashboard-preset.resolver';
import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';

describe('DashboardPresetResolver', () => {
  const dashboardPresetService = {
    getPresetsForDashboard: jest.fn(),
    getActiveFilterState: jest.fn(),
    savePreset: jest.fn(),
    validateFilterState: jest.fn(),
  } as unknown as DashboardPresetService;

  const resolver = new DashboardPresetResolver(dashboardPresetService);
  const controller = new DashboardPresetController(dashboardPresetService);
  const validationPipe = new ResolverValidationPipe();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty presets and null active filter state for a dashboard', async () => {
    dashboardPresetService.getPresetsForDashboard = jest
      .fn()
      .mockResolvedValue([]);
    dashboardPresetService.getActiveFilterState = jest
      .fn()
      .mockResolvedValue(null);

    const result = await resolver.dashboardFiltersAndPresets(
      'dashboard-1',
      {} as any,
    );

    expect(result).toEqual({
      activeFilterState: null,
      presets: [],
    });
    expect(dashboardPresetService.getPresetsForDashboard).toHaveBeenCalledWith(
      'dashboard-1',
    );
    expect(dashboardPresetService.getActiveFilterState).toHaveBeenCalledWith(
      'dashboard-1',
    );
  });

  it('should save a dashboard preset and return success with the preset payload', async () => {
    const filterState = {
      recordFilters: [
        {
          fieldMetadataId: 'company-id',
          operand: 'contains',
          value: 'Acme',
        },
      ],
      recordFilterGroups: [
        {
          id: 'group-1',
          logicalOperator: 'AND',
        },
      ],
    };

    dashboardPresetService.savePreset = jest.fn().mockResolvedValue({
      id: 'stub-preset-id',
      name: 'My Preset',
      filterState,
    });

    const result = await resolver.saveDashboardPreset(
      'dashboard-1',
      'My Preset',
      filterState,
      {} as any,
    );

    expect(result).toEqual({
      success: true,
      preset: {
        id: 'stub-preset-id',
        name: 'My Preset',
        filterState,
      },
    });
    expect(dashboardPresetService.savePreset).toHaveBeenCalledWith(
      'dashboard-1',
      'My Preset',
      filterState,
    );
  });

  it('should reject an empty filter state payload with the resolver validation pipe', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: SaveDashboardPresetInput,
      data: '',
    };

    await expect(
      validationPipe.transform(
        {
          dashboardId: '2f29ef60-b7a4-4f8e-9c1d-2e3f4a5b6c7d',
          name: 'Invalid Preset',
          filterState: null,
        },
        metadata,
      ),
    ).rejects.toMatchObject({
      message: 'Filter state is required',
      extensions: {
        code: ErrorCode.BAD_USER_INPUT,
      },
    });
  });

  it('should expose the same preset contract through the REST controller', async () => {
    const filterState = {
      recordFilters: [
        {
          fieldMetadataId: 'company-id',
          operand: 'contains',
          value: 'Acme',
        },
      ],
    };

    dashboardPresetService.savePreset = jest.fn().mockResolvedValue({
      id: 'stub-preset-id',
      name: 'REST Preset',
      filterState,
    });
    dashboardPresetService.getPresetsForDashboard = jest
      .fn()
      .mockResolvedValue([]);
    dashboardPresetService.getActiveFilterState = jest
      .fn()
      .mockResolvedValue(null);

    await expect(controller.findAll('dashboard-1')).resolves.toEqual({
      activeFilterState: null,
      presets: [],
    });
    await expect(
      controller.create('dashboard-1', {
        name: 'REST Preset',
        filterState,
      }),
    ).resolves.toEqual({
      success: true,
      preset: {
        id: 'stub-preset-id',
        name: 'REST Preset',
        filterState,
      },
    });
  });
});
