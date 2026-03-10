import { type PropsWithChildren } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  DashboardFiltersProvider,
  useDashboardFilters,
} from '@/dashboards/hooks/useDashboardFilters';
import { useApplyDashboardFiltersFromUrl } from '@/dashboards/hooks/useApplyDashboardFiltersFromUrl';

const Wrapper = ({ children }: PropsWithChildren) => (
  <MemoryRouter initialEntries={['/dashboards/1?filter[status][is]=won']}>
    <Routes>
      <Route
        path="/dashboards/:id"
        element={<DashboardFiltersProvider>{children}</DashboardFiltersProvider>}
      />
    </Routes>
  </MemoryRouter>
);

describe('useApplyDashboardFiltersFromUrl', () => {
  it('hydrates dashboard filters once from query params', async () => {
    const { result } = renderHook(
      () => {
        useApplyDashboardFiltersFromUrl();

        return useDashboardFilters();
      },
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(result.current.recordFilters).toHaveLength(1);
    });

    expect(result.current.recordFilters[0].fieldMetadataId).toBe('status');
    expect(result.current.recordFilters[0].value).toBe('won');
  });
});
