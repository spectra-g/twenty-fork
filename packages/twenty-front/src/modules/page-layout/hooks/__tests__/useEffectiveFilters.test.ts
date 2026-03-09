import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { type DashboardFilterState } from '@/page-layout/types/DashboardFilterState';
import { useEffectiveFilters } from '@/page-layout/hooks/useEffectiveFilters';
import { renderHook } from '@testing-library/react';

describe('useEffectiveFilters', () => {
  it('merges local and dashboard filters with dashboard precedence', () => {
    const localFilters: ChartFilters = {
      recordFilters: [
        {
          id: 'local-stage',
          fieldMetadataId: 'field-stage',
          value: 'Prospecting',
          displayValue: 'Prospecting',
          type: 'TEXT',
          operand: 'IS',
          label: 'Stage',
        },
      ],
      recordFilterGroups: [],
    };

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

    const { result } = renderHook(() =>
      useEffectiveFilters({ localFilters, dashboardFilterState }),
    );

    expect(result.current.recordFilters).toHaveLength(1);
    expect(result.current.recordFilters?.[0].value).toBe('Closed Won');
  });

  it('returns local filters when dashboard state is empty', () => {
    const localFilters: ChartFilters = {
      recordFilters: [
        {
          id: 'local-owner',
          fieldMetadataId: 'field-owner',
          value: 'Alice',
          displayValue: 'Alice',
          type: 'TEXT',
          operand: 'IS',
          label: 'Owner',
        },
      ],
      recordFilterGroups: [],
    };

    const { result } = renderHook(() =>
      useEffectiveFilters({
        localFilters,
        dashboardFilterState: {
          recordFilters: [],
          recordFilterGroups: [],
        },
      }),
    );

    expect(result.current).toEqual(localFilters);
  });
});
