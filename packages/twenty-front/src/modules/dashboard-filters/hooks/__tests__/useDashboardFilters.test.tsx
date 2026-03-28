import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import { useDashboardFilters } from '@/dashboard-filters/hooks/useDashboardFilters';
import { resetJotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const store = resetJotaiStore();

  return <JotaiProvider store={store}>{children}</JotaiProvider>;
};

describe('useDashboardFilters', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('keeps draft changes separate from applied filters until apply is triggered', () => {
    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper,
    });

    act(() => {
      result.current.setOwnerId('owner-1');
      result.current.setStartDate('2026-01-01');
      result.current.setEndDate('2026-01-31');
      result.current.setStageId('NEW');
    });

    expect(result.current.draftFilters).toEqual({
      ownerId: 'owner-1',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      stageId: 'NEW',
    });
    expect(result.current.appliedFilters).toEqual({
      ownerId: '',
      startDate: '',
      endDate: '',
      stageId: '',
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters).toEqual({
      ownerId: 'owner-1',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      stageId: 'NEW',
    });
  });

  it('clears both draft and applied filters', () => {
    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper,
    });

    act(() => {
      result.current.setOwnerId('owner-1');
      result.current.setStageId('QUALIFIED');
      result.current.applyFilters();
      result.current.clearFilters();
    });

    expect(result.current.draftFilters).toEqual({
      ownerId: '',
      startDate: '',
      endDate: '',
      stageId: '',
    });
    expect(result.current.appliedFilters).toEqual({
      ownerId: '',
      startDate: '',
      endDate: '',
      stageId: '',
    });
  });
});
