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

  it('renames an existing preset with a trimmed non-empty name', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardFilterProvider initialPresets={[existingPreset]}>
        {children}
      </DashboardFilterProvider>
    );

    const { result } = renderHook(() => useDashboardPresets(), {
      wrapper,
    });

    act(() => {
      result.current.renamePreset('dashboard-preset-2', ' Renamed Preset ');
    });

    expect(result.current.presets).toEqual([
      expect.objectContaining({
        id: 'dashboard-preset-2',
        name: 'Renamed Preset',
      }),
    ]);
  });

  it('keeps the current preset name when rename receives only whitespace', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardFilterProvider initialPresets={[existingPreset]}>
        {children}
      </DashboardFilterProvider>
    );

    const { result } = renderHook(() => useDashboardPresets(), {
      wrapper,
    });

    act(() => {
      result.current.renamePreset('dashboard-preset-2', '   ');
    });

    expect(result.current.presets[0].name).toBe('Existing Preset');
  });

  it('deletes an existing preset by id', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardFilterProvider initialPresets={[existingPreset]}>
        {children}
      </DashboardFilterProvider>
    );

    const { result } = renderHook(() => useDashboardPresets(), {
      wrapper,
    });

    act(() => {
      result.current.deletePreset('dashboard-preset-2');
    });

    expect(result.current.presets).toEqual([]);
  });
});
