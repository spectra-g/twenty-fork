import { type PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  DashboardFiltersProvider,
  useDashboardFilters,
} from '@/dashboards/hooks/useDashboardFilters';

const createFilter = (
  id: string,
  fieldMetadataId: string,
  value: string,
): RecordFilter => ({
  id,
  fieldMetadataId,
  value,
  displayValue: value,
  type: 'TEXT',
  operand: ViewFilterOperand.IS,
  label: fieldMetadataId,
});

const wrapper = ({ children }: PropsWithChildren) => (
  <DashboardFiltersProvider>{children}</DashboardFiltersProvider>
);

describe('useDashboardFilters', () => {
  it('adds, updates and removes filters', () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });

    act(() => {
      result.current.addFilter(createFilter('f1', 'status', 'won'));
    });

    act(() => {
      result.current.updateFilter('f1', { value: 'open', displayValue: 'open' });
    });

    act(() => {
      result.current.removeFilter('f1');
    });

    expect(result.current.recordFilters).toEqual([]);
  });

  it('keeps modified state false without an active preset and supports reset', () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });

    act(() => {
      result.current.addFilter(createFilter('f1', 'status', 'won'));
    });

    expect(result.current.isPresetModified).toBe(false);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.recordFilters).toEqual([]);
    expect(result.current.recordFilterGroups).toEqual([]);
    expect(result.current.isPresetModified).toBe(false);
  });

  it('tracks modified state against an active preset baseline', () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });

    const presetFilter = createFilter('preset-1', 'status', 'won');

    act(() => {
      result.current.activatePreset({
        presetId: 'baseline',
        recordFilters: [presetFilter],
        recordFilterGroups: [],
      });
    });

    expect(result.current.selectedPresetId).toBe('baseline');
    expect(result.current.isPresetModified).toBe(false);

    act(() => {
      result.current.updateFilter('preset-1', {
        value: 'open',
        displayValue: 'open',
      });
    });

    expect(result.current.isPresetModified).toBe(true);
  });
});
