import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';

describe('DashboardPresetService', () => {
  let service: DashboardPresetService;

  beforeEach(() => {
    service = new DashboardPresetService();
  });

  describe('create', () => {
    it('creates a preset with id, name and filter', async () => {
      const filter = { status: 'OPEN' };

      const result = await service.create({
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

  describe('select', () => {
    it('marks the selected preset as active', async () => {
      const result = await service.select({
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

  describe('update', () => {
    it('returns an updated preset with provided filter payload', async () => {
      const filter = { status: 'CLOSED', owner: 'me' };

      const result = await service.update({
        presetId: 'preset-id',
        filter,
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: 'preset-id',
          filter,
        }),
      );
    });
  });

  describe('getDashboard', () => {
    it('returns dashboard preset list and default preset id', async () => {
      const result = await service.getDashboard();

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
