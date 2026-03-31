import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useDashboardFiltersFromQueryParams } from '@/dashboards/hooks/useDashboardFiltersFromQueryParams';

describe('useDashboardFiltersFromQueryParams', () => {
  it('parses dashboard filters from the URL query string', () => {
    const { result } = renderHook(() => useDashboardFiltersFromQueryParams(), {
      wrapper: ({ children }) => (
        <MemoryRouter
          initialEntries={[
            '/?dashboardFilter[ownerId]=owner-id&dashboardFilter[startDate]=2026-03-01&dashboardFilter[endDate]=2026-03-15&dashboardFilter[stage]=Proposal',
          ]}
        >
          {children}
        </MemoryRouter>
      ),
    });

    expect(result.current.dashboardFiltersFromQueryParams).toEqual({
      ownerId: 'owner-id',
      startDate: '2026-03-01',
      endDate: '2026-03-15',
      stage: 'Proposal',
    });
  });

  it('returns null when the URL does not contain dashboard filters', () => {
    const { result } = renderHook(() => useDashboardFiltersFromQueryParams(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
      ),
    });

    expect(result.current.dashboardFiltersFromQueryParams).toBeNull();
  });
});
