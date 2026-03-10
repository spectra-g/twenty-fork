import { DashboardResolver } from 'src/modules/dashboard/resolvers/dashboard.resolver';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';
import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';

describe('DashboardResolver', () => {
  let resolver: DashboardResolver;
  let dashboardPresetService: DashboardPresetService;

  beforeEach(() => {
    const dashboardDuplicationService = {
      duplicateDashboard: jest.fn(),
    } as unknown as DashboardDuplicationService;
    dashboardPresetService = {
      create: jest.fn().mockResolvedValue({
        id: 'preset-id',
        name: 'My Preset',
        filter: { status: 'OPEN' },
        isActive: false,
      }),
      select: jest.fn().mockResolvedValue({
        id: 'preset-id',
        name: 'My Preset',
        filter: { status: 'OPEN' },
        isActive: true,
      }),
      update: jest.fn().mockResolvedValue({
        id: 'preset-id',
        name: 'Updated Preset',
        filter: { status: 'CLOSED', owner: 'me' },
        isActive: false,
      }),
      getDashboard: jest.fn().mockResolvedValue({
        presets: [
          {
            id: 'preset-id',
            name: 'My Preset',
            filter: { status: 'OPEN' },
            isActive: true,
          },
        ],
        defaultPresetId: 'preset-id',
      }),
    } as unknown as DashboardPresetService;

    resolver = new DashboardResolver(
      dashboardDuplicationService,
      dashboardPresetService,
    );
  });

  describe('AC-001 createDashboardFilterPreset', () => {
    it('returns a preset with id, name and filter', async () => {
      const filter = { status: 'OPEN' };

      const result = await (resolver as any).createDashboardFilterPreset({
        name: 'My Preset',
        filter,
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: 'My Preset',
          filter,
        }),
      );
    });
  });

  describe('AC-002 selectDashboardFilterPreset', () => {
    it('returns an active preset for a given preset id', async () => {
      const result = await (resolver as any).selectDashboardFilterPreset({
        presetId: 'preset-id',
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: 'preset-id',
          isActive: true,
        }),
      );
    });
  });

  describe('AC-003 updateDashboardFilterPreset', () => {
    it('returns an updated preset with merged filter payload', async () => {
      const result = await (resolver as any).updateDashboardFilterPreset({
        presetId: 'preset-id',
        filter: { status: 'CLOSED', owner: 'me' },
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: 'preset-id',
          filter: { status: 'CLOSED', owner: 'me' },
        }),
      );
    });
  });

  describe('AC-004 dashboard query', () => {
    it('returns presets and defaultPresetId fields', async () => {
      const result = await (resolver as any).dashboard();

      expect(result).toEqual(
        expect.objectContaining({
          presets: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              filter: expect.any(Object),
            }),
          ]),
          defaultPresetId: expect.any(String),
        }),
      );
    });
  });
});
