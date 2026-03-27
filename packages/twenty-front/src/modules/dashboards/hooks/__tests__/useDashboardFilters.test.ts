import { act, renderHook } from '@testing-library/react';

import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';

describe('useDashboardFilters', () => {
  it('should store the selected stage filter in memory', () => {
    const { result } = renderHook(() => useDashboardFilters());

    act(() => {
      result.current.setActiveStageFilter({
        value: 'qualified',
        label: 'Qualified',
      });
    });

    expect(result.current.activeStageFilter).toEqual({
      value: 'qualified',
      label: 'Qualified',
    });
  });

  it('should clear the active stage filter', () => {
    const { result } = renderHook(() => useDashboardFilters());

    act(() => {
      result.current.setActiveStageFilter({
        value: 'proposal',
        label: 'Proposal',
      });
    });

    act(() => {
      result.current.clearActiveStageFilter();
    });

    expect(result.current.activeStageFilter).toBeNull();
  });
});
