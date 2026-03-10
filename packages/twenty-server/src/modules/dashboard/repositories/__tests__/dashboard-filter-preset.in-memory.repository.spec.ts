import { DashboardFilterPresetInMemoryRepository } from 'src/modules/dashboard/repositories/dashboard-filter-preset.in-memory.repository';

describe('DashboardFilterPresetInMemoryRepository (outer acceptance)', () => {
  it('AC-001: findByDashboardId returns an empty array for any dashboard ID', async () => {
    const repository = new DashboardFilterPresetInMemoryRepository();

    const presets = await repository.findByDashboardId('dashboard-1');

    expect(presets).toEqual([]);
  });

  it('AC-002: save returns saved preset with an auto-generated ID', async () => {
    const repository = new DashboardFilterPresetInMemoryRepository();

    const saved = await repository.save({
      dashboardId: 'dashboard-1',
      name: 'My Preset',
      filters: {
        recordFilters: [],
        recordFilterGroups: [],
      },
    });

    expect(saved).toMatchObject({
      dashboardId: 'dashboard-1',
      name: 'My Preset',
      filters: {
        recordFilters: [],
        recordFilterGroups: [],
      },
    });
    expect(saved.id).toEqual(expect.any(String));
  });
});
