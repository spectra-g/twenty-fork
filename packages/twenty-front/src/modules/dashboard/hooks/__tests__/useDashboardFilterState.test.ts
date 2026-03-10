import { useDashboardFilterState } from '@/dashboard/hooks/useDashboardFilterState';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { createStore } from 'jotai/vanilla';
import { createElement, type ReactNode } from 'react';

const createWrapper = () => {
  const store = createStore();

  return ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store }, children);
};

describe('useDashboardFilterState', () => {
  it('returns default empty filter values', () => {
    const { result } = renderHook(() => useDashboardFilterState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.filters).toEqual({
      owner: null,
      dateRange: null,
      stage: null,
    });
  });

  it('updates owner, date range and stage filters', () => {
    const { result } = renderHook(() => useDashboardFilterState(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setOwnerFilter('John');
      result.current.setDateRangeFilter('LAST_30_DAYS');
      result.current.setStageFilter('Won');
    });

    expect(result.current.filters).toEqual({
      owner: 'John',
      dateRange: 'LAST_30_DAYS',
      stage: 'Won',
    });
  });
});
