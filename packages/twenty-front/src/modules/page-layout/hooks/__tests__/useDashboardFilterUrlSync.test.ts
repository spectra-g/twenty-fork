import { type DashboardFilterState } from '@/page-layout/types/DashboardFilterState';
import { useDashboardFilterUrlSync } from '@/page-layout/hooks/useDashboardFilterUrlSync';
import { renderHook, waitFor } from '@testing-library/react';
import { useSearchParams } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
}));

describe('useDashboardFilterUrlSync', () => {
  const setSearchParams = jest.fn();
  const setDashboardFilterState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('serializes dashboard filters to URL query params', async () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams('viewId=abc'),
      setSearchParams,
    ]);

    const dashboardFilterState: DashboardFilterState = {
      recordFilters: [
        {
          id: 'global-stage',
          fieldMetadataId: 'field-stage',
          value: 'Closed Won',
          displayValue: 'Closed Won',
          type: 'TEXT',
          operand: 'IS',
          label: 'Stage',
        },
      ],
      recordFilterGroups: [],
    };

    renderHook(() =>
      useDashboardFilterUrlSync({
        dashboardFilterState,
        setDashboardFilterState,
        enabled: true,
      }),
    );

    await waitFor(() => expect(setSearchParams).toHaveBeenCalled());

    const latestParams = setSearchParams.mock.calls.at(-1)?.[0] as URLSearchParams;

    expect(latestParams.get('dashboardFilters')).toContain('Closed Won');
    expect(latestParams.toString().length).toBeLessThanOrEqual(2048);
  });

  it('does not write dashboard filters when encoded URL exceeds 2048 chars', async () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams('viewId=abc'),
      setSearchParams,
    ]);

    const dashboardFilterState: DashboardFilterState = {
      recordFilters: [
        {
          id: 'global-long',
          fieldMetadataId: 'field-stage',
          value: 'x'.repeat(2200),
          displayValue: 'x'.repeat(2200),
          type: 'TEXT',
          operand: 'IS',
          label: 'Stage',
        },
      ],
      recordFilterGroups: [],
    };

    renderHook(() =>
      useDashboardFilterUrlSync({
        dashboardFilterState,
        setDashboardFilterState,
        enabled: true,
      }),
    );

    await waitFor(() => expect(setSearchParams).toHaveBeenCalled());

    const latestParams = setSearchParams.mock.calls.at(-1)?.[0] as URLSearchParams;

    expect(latestParams.has('dashboardFilters')).toBe(false);
  });

  it('hydrates dashboard filters from URL query params', async () => {
    const serialized = JSON.stringify({
      recordFilters: [
        {
          id: 'global-stage',
          fieldMetadataId: 'field-stage',
          value: 'Closed Won',
          displayValue: 'Closed Won',
          type: 'TEXT',
          operand: 'IS',
          label: 'Stage',
        },
      ],
      recordFilterGroups: [],
    });

    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams(`dashboardFilters=${encodeURIComponent(serialized)}`),
      setSearchParams,
    ]);

    renderHook(() =>
      useDashboardFilterUrlSync({
        dashboardFilterState: {
          recordFilters: [],
          recordFilterGroups: [],
        },
        setDashboardFilterState,
        enabled: true,
      }),
    );

    await waitFor(() => expect(setDashboardFilterState).toHaveBeenCalled());

    expect(setDashboardFilterState).toHaveBeenCalledWith({
      recordFilters: [
        expect.objectContaining({
          fieldMetadataId: 'field-stage',
          value: 'Closed Won',
        }),
      ],
      recordFilterGroups: [],
    });
  });
});
