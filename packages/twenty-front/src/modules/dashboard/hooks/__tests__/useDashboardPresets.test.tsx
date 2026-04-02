import { act, renderHook } from '@testing-library/react';

import { DashboardFilterProvider } from '@/dashboard/contexts/DashboardFilterContext';
import { useDashboardPresets } from '@/dashboard/hooks/useDashboardPresets';
import { type DashboardPreset } from '@/dashboard/types/DashboardPreset';

const existingPreset: DashboardPreset = {
  id: 'dashboard-preset-2',
  name: 'Existing Preset',
  filters: [],
  filterGroups: [],
  createdAt: '2026-04-02T00:00:00.000Z',
  updatedAt: '2026-04-02T00:00:00.000Z',
};

describe('useDashboardPresets', () => {
  it('creates a unique id when a saved preset would otherwise collide with an existing one', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardFilterProvider initialPresets={[existingPreset]}>
        {children}
      </DashboardFilterProvider>
    );

    const { result } = renderHook(() => useDashboardPresets(), {
      wrapper,
    });

    act(() => {
      result.current.savePreset('New Preset');
    });

    expect(result.current.presets).toHaveLength(2);
    expect(
      new Set(result.current.presets.map((preset) => preset.id)).size,
    ).toBe(2);
    expect(result.current.presets[0].id).toMatch(/^dashboard-preset-/);
  });
});
