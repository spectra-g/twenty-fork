import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type PropsWithChildren } from 'react';

const getWrapper = () => {
  const jotaiStore = createStore();

  return ({ children }: PropsWithChildren) => (
    <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
  );
};

describe('useDashboardFilters', () => {
  it('should keep filters isolated per dashboard id', () => {
    const wrapper = getWrapper();

    const dashboardAHook = renderHook(
      () => useDashboardFilters('dashboard-a'),
      {
        wrapper,
      },
    );

    const dashboardBHook = renderHook(
      () => useDashboardFilters('dashboard-b'),
      {
        wrapper,
      },
    );

    expect(dashboardAHook.result.current.dashboardFilters.ownerId).toBeNull();
    expect(dashboardBHook.result.current.dashboardFilters.ownerId).toBeNull();

    act(() => {
      dashboardAHook.result.current.setDashboardFilter('ownerId', 'sales-team');
    });

    expect(dashboardAHook.result.current.dashboardFilters.ownerId).toBe(
      'sales-team',
    );
    expect(dashboardBHook.result.current.dashboardFilters.ownerId).toBeNull();
  });

  it('should clear a filter when null is provided', () => {
    const wrapper = getWrapper();

    const { result } = renderHook(() => useDashboardFilters('dashboard-a'), {
      wrapper,
    });

    act(() => {
      result.current.setDashboardFilter('stageId', 'qualified');
    });

    expect(result.current.dashboardFilters.stageId).toBe('qualified');

    act(() => {
      result.current.setDashboardFilter('stageId', null);
    });

    expect(result.current.dashboardFilters.stageId).toBeNull();
  });
});
