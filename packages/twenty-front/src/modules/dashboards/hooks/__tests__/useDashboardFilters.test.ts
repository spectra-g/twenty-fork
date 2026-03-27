import { act, renderHook } from '@testing-library/react';
import { ViewFilterOperand } from 'twenty-shared/types';

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

  it('should store owner filters as dashboard filter variables', () => {
    const { result } = renderHook(() => useDashboardFilters());

    act(() => {
      result.current.setDashboardFilter({
        id: 'owner',
        fieldMetadataId: 'owner-field-metadata-id',
        type: 'owner',
        label: 'Owner',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          selectedRecordIds: ['workspace-member-id'],
          isCurrentWorkspaceMemberSelected: false,
        }),
        displayValue: 'Ada Lovelace',
      });
    });

    expect(result.current.dashboardFilters).toEqual([
      {
        fieldMetadataId: 'owner-field-metadata-id',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          selectedRecordIds: ['workspace-member-id'],
          isCurrentWorkspaceMemberSelected: false,
        }),
      },
    ]);
  });

  it('should replace an existing dashboard date filter when updated', () => {
    const { result } = renderHook(() => useDashboardFilters());

    act(() => {
      result.current.setDashboardFilter({
        id: 'created-at',
        fieldMetadataId: 'created-at-field-metadata-id',
        type: 'date',
        label: 'Created at',
        operand: ViewFilterOperand.IS_AFTER,
        value: '2025-01-01',
        displayValue: 'Jan 1, 2025',
      });
    });

    act(() => {
      result.current.setDashboardFilter({
        id: 'created-at',
        fieldMetadataId: 'created-at-field-metadata-id',
        type: 'date',
        label: 'Created at',
        operand: ViewFilterOperand.IS_RELATIVE,
        value: '{"direction":"THIS","unit":"MONTH"}',
        displayValue: 'This month',
      });
    });

    expect(result.current.dashboardFilters).toEqual([
      {
        fieldMetadataId: 'created-at-field-metadata-id',
        operand: ViewFilterOperand.IS_RELATIVE,
        value: '{"direction":"THIS","unit":"MONTH"}',
      },
    ]);
  });
});
