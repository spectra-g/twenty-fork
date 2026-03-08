import {
  DashboardPresetService,
  type DashboardPresetRepository,
  DuplicatePresetNameException,
  LimitExceededException,
  UnauthorizedPresetAccessException,
} from 'src/modules/dashboard/services/dashboard-preset.service';
import { PresetVisibility } from 'src/modules/dashboard/enums/preset-visibility.enum';

describe('DashboardPresetService', () => {
  let service: DashboardPresetService;
  let repository: jest.Mocked<DashboardPresetRepository>;

  beforeEach(() => {
    repository = {
      countByDashboardAndUser: jest.fn(),
      existsByNameForDashboardAndUser: jest.fn(),
      create: jest.fn(),
      findByDashboardId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new DashboardPresetService(repository);
  });

  describe('createPreset', () => {
    it('creates preset when under per-dashboard limit', async () => {
      repository.countByDashboardAndUser.mockResolvedValue(49);
      repository.existsByNameForDashboardAndUser.mockResolvedValue(false);
      repository.create.mockResolvedValue({
        id: 'preset-1',
        dashboardId: 'dashboard-1',
        ownerId: 'user-1',
        name: 'My Preset',
        filters: { status: 'ACTIVE' },
        visibility: PresetVisibility.PRIVATE,
      });

      const result = await service.createPreset({
        dashboardId: 'dashboard-1',
        userId: 'user-1',
        preset: {
          dashboardId: 'dashboard-1',
          name: 'My Preset',
          filters: { status: 'ACTIVE' },
          visibility: PresetVisibility.PRIVATE,
        },
      });

      expect(result.id).toBe('preset-1');
    });

    it('throws limit exceeded when user already has 50 presets for dashboard', async () => {
      repository.countByDashboardAndUser.mockResolvedValue(50);

      await expect(
        service.createPreset({
          dashboardId: 'dashboard-1',
          userId: 'user-1',
          preset: {
            dashboardId: 'dashboard-1',
            name: 'Will Fail',
            filters: {},
            visibility: PresetVisibility.PRIVATE,
          },
        }),
      ).rejects.toBeInstanceOf(LimitExceededException);

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('throws duplicate error when name already exists for dashboard and user', async () => {
      repository.countByDashboardAndUser.mockResolvedValue(0);
      repository.existsByNameForDashboardAndUser.mockResolvedValue(true);

      await expect(
        service.createPreset({
          dashboardId: 'dashboard-1',
          userId: 'user-1',
          preset: {
            dashboardId: 'dashboard-1',
            name: 'Duplicate Name',
            filters: {},
            visibility: PresetVisibility.PRIVATE,
          },
        }),
      ).rejects.toBeInstanceOf(DuplicatePresetNameException);
    });

    it('allows same name on different dashboard', async () => {
      repository.countByDashboardAndUser.mockResolvedValue(0);
      repository.existsByNameForDashboardAndUser.mockResolvedValue(false);
      repository.create.mockResolvedValue({
        id: 'preset-2',
        dashboardId: 'dashboard-2',
        ownerId: 'user-1',
        name: 'Shared Name',
        filters: {},
        visibility: PresetVisibility.PRIVATE,
      });

      const result = await service.createPreset({
        dashboardId: 'dashboard-2',
        userId: 'user-1',
        preset: {
          dashboardId: 'dashboard-2',
          name: 'Shared Name',
          filters: {},
          visibility: PresetVisibility.PRIVATE,
        },
      });

      expect(result.dashboardId).toBe('dashboard-2');
    });

    it('allows same name for different users on shared dashboard', async () => {
      repository.countByDashboardAndUser.mockResolvedValue(1);
      repository.existsByNameForDashboardAndUser.mockResolvedValue(false);
      repository.create.mockResolvedValue({
        id: 'preset-3',
        dashboardId: 'dashboard-1',
        ownerId: 'user-2',
        name: 'My Name',
        filters: {},
        visibility: PresetVisibility.PRIVATE,
      });

      const result = await service.createPreset({
        dashboardId: 'dashboard-1',
        userId: 'user-2',
        preset: {
          dashboardId: 'dashboard-1',
          name: 'My Name',
          filters: {},
          visibility: PresetVisibility.PRIVATE,
        },
      });

      expect(result.ownerId).toBe('user-2');
    });
  });

  describe('findPresets', () => {
    it('returns only presets visible to user by visibility policy', async () => {
      repository.findByDashboardId.mockResolvedValue([
        {
          id: 'private-owner',
          dashboardId: 'dashboard-1',
          ownerId: 'user-1',
          name: 'Owner Private',
          filters: {},
          visibility: PresetVisibility.PRIVATE,
        },
        {
          id: 'private-other',
          dashboardId: 'dashboard-1',
          ownerId: 'user-2',
          name: 'Other Private',
          filters: {},
          visibility: PresetVisibility.PRIVATE,
        },
        {
          id: 'team-match',
          dashboardId: 'dashboard-1',
          ownerId: 'user-2',
          name: 'Team Match',
          filters: {},
          visibility: PresetVisibility.TEAM,
          teamIds: ['team-a'],
        },
        {
          id: 'team-miss',
          dashboardId: 'dashboard-1',
          ownerId: 'user-2',
          name: 'Team Miss',
          filters: {},
          visibility: PresetVisibility.TEAM,
          teamIds: ['team-z'],
        },
        {
          id: 'public',
          dashboardId: 'dashboard-1',
          ownerId: 'user-3',
          name: 'Public',
          filters: {},
          visibility: PresetVisibility.PUBLIC,
        },
      ]);

      const result = await service.findPresets({
        dashboardId: 'dashboard-1',
        userId: 'user-1',
        teamIds: ['team-a'],
      });

      expect(result.map((preset) => preset.id).sort()).toEqual([
        'private-owner',
        'public',
        'team-match',
      ]);
    });
  });

  describe('updatePreset and deletePreset authorization', () => {
    it('allows owner to update preset', async () => {
      repository.findById.mockResolvedValue({
        id: 'preset-1',
        dashboardId: 'dashboard-1',
        ownerId: 'user-1',
        name: 'Mine',
        filters: {},
        visibility: PresetVisibility.PRIVATE,
      });
      repository.update.mockResolvedValue({
        id: 'preset-1',
        dashboardId: 'dashboard-1',
        ownerId: 'user-1',
        name: 'Updated',
        filters: {},
        visibility: PresetVisibility.PRIVATE,
      });

      const result = await service.updatePreset({
        presetId: 'preset-1',
        userId: 'user-1',
        data: { name: 'Updated' },
      });

      expect(result.name).toBe('Updated');
    });

    it('throws unauthorized for update when user lacks edit rights', async () => {
      repository.findById.mockResolvedValue({
        id: 'preset-1',
        dashboardId: 'dashboard-1',
        ownerId: 'user-1',
        name: 'Mine',
        filters: {},
        visibility: PresetVisibility.PRIVATE,
      });

      await expect(
        service.updatePreset({
          presetId: 'preset-1',
          userId: 'user-2',
          data: { name: 'Hacked' },
        }),
      ).rejects.toBeInstanceOf(UnauthorizedPresetAccessException);
    });

    it('allows explicit editor to update preset', async () => {
      repository.findById.mockResolvedValue({
        id: 'preset-1',
        dashboardId: 'dashboard-1',
        ownerId: 'user-1',
        name: 'Shared',
        filters: {},
        visibility: PresetVisibility.TEAM,
        editorIds: ['user-2'],
      });
      repository.update.mockResolvedValue({
        id: 'preset-1',
        dashboardId: 'dashboard-1',
        ownerId: 'user-1',
        name: 'Editor Update',
        filters: {},
        visibility: PresetVisibility.TEAM,
        editorIds: ['user-2'],
      });

      const result = await service.updatePreset({
        presetId: 'preset-1',
        userId: 'user-2',
        data: { name: 'Editor Update' },
      });

      expect(result.name).toBe('Editor Update');
    });

    it('allows owner to delete preset', async () => {
      repository.findById.mockResolvedValue({
        id: 'preset-1',
        dashboardId: 'dashboard-1',
        ownerId: 'user-1',
        name: 'Mine',
        filters: {},
        visibility: PresetVisibility.PRIVATE,
      });

      await service.deletePreset({
        presetId: 'preset-1',
        userId: 'user-1',
      });

      expect(repository.delete).toHaveBeenCalledWith('preset-1');
    });

    it('throws unauthorized for delete when user lacks rights', async () => {
      repository.findById.mockResolvedValue({
        id: 'preset-1',
        dashboardId: 'dashboard-1',
        ownerId: 'user-1',
        name: 'Mine',
        filters: {},
        visibility: PresetVisibility.PRIVATE,
      });

      await expect(
        service.deletePreset({
          presetId: 'preset-1',
          userId: 'user-3',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedPresetAccessException);
    });
  });
});
