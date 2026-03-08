import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { pageLayoutFilterQueryParam, usePageLayoutFilters } from '@/page-layout/hooks/usePageLayoutFilters';
import { type GlobalFilterConfig } from '@/page-layout/types/PageLayoutConfig';

const config: GlobalFilterConfig = {
  enabled: true,
  defaultPresetId: 'default',
  presets: [
    {
      id: 'default',
      name: 'Default',
      filters: [],
      filterGroups: [],
    },
    {
      id: 'recent',
      name: 'Recent',
      filters: [
        {
          id: 'f-1',
          fieldMetadataId: 'field-1',
          value: '30',
          displayValue: '30',
          type: 'TEXT',
          operand: 'contains',
          label: 'Recent',
        } as any,
      ],
      filterGroups: [],
    },
  ],
};

const getWrapper = (route: string) => {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="*" element={children} />
      </Routes>
    </MemoryRouter>
  );
};

describe('usePageLayoutFilters', () => {
  it('applies presets and increments refresh key', () => {
    const { result } = renderHook(() => usePageLayoutFilters(config), {
      wrapper: getWrapper('/objects/dashboards/test-dashboard'),
    });

    expect(result.current.activePresetId).toBe('default');
    expect(result.current.refreshKey).toBe(0);

    act(() => {
      result.current.applyPreset('recent');
    });

    expect(result.current.activePresetId).toBe('recent');
    expect(result.current.activePreset?.name).toBe('Recent');
    expect(result.current.refreshKey).toBe(1);
  });

  it('restores preset from URL query params', () => {
    const { result } = renderHook(() => usePageLayoutFilters(config), {
      wrapper: getWrapper(
        `/objects/dashboards/test-dashboard?${pageLayoutFilterQueryParam}=recent`,
      ),
    });

    expect(result.current.activePresetId).toBe('recent');
    expect(result.current.activePreset?.name).toBe('Recent');
  });
});
