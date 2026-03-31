import { dashboardFiltersState } from '@/dashboards/states/dashboardFiltersAtom';
import { DashboardFilterRefreshIndicator } from '@/dashboards/components/DashboardFilterRefreshIndicator';
import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { render, screen } from '@testing-library/react';
import { createStore } from 'jotai';

describe('DashboardFilterRefreshIndicator', () => {
  it('renders a live refresh status when filters changed for the current dashboard', () => {
    const store = createStore();

    store.set(dashboardFiltersState.atom, {
      pageLayoutId: 'page-layout-id',
      ownerId: 'owner-id',
      ownerLabel: 'Alice',
      startDate: null,
      endDate: null,
      stage: null,
      refreshCount: 2,
    });

    render(
      <PageLayoutTestWrapper store={store}>
        <DashboardFilterRefreshIndicator pageLayoutId="page-layout-id" />
      </PageLayoutTestWrapper>,
    );

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByTestId('widget-refreshing')).toHaveTextContent(
      'Refreshing 2',
    );
  });

  it('does not render anything when the refresh belongs to another dashboard', () => {
    const store = createStore();

    store.set(dashboardFiltersState.atom, {
      pageLayoutId: 'other-page-layout-id',
      ownerId: 'owner-id',
      ownerLabel: 'Alice',
      startDate: null,
      endDate: null,
      stage: null,
      refreshCount: 1,
    });

    render(
      <PageLayoutTestWrapper store={store}>
        <DashboardFilterRefreshIndicator pageLayoutId="page-layout-id" />
      </PageLayoutTestWrapper>,
    );

    expect(screen.queryByTestId('widget-refreshing')).not.toBeInTheDocument();
  });
});
