import {
  DASHBOARD_PRESETS_LOADING_DELAY_MS,
  useDashboardPresets,
} from '@/dashboards/hooks/useDashboardPresets';
import { act, renderHook } from '@testing-library/react';

describe('useDashboardPresets', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should stay loading until the exact simulated delay elapses', () => {
    const { result } = renderHook(() => useDashboardPresets());

    expect(result.current.loading).toBe(true);
    expect(result.current.presets).toEqual([]);

    act(() => {
      jest.advanceTimersByTime(DASHBOARD_PRESETS_LOADING_DELAY_MS - 1);
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.presets).toEqual([]);
  });
});
