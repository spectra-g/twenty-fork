import { DashboardFilterPanel } from '@/dashboard/components/DashboardFilterPanel';
import { render, screen, fireEvent } from '@testing-library/react';

const mockUseDashboardFilterState = jest.fn();

jest.mock('@/dashboard/hooks/useDashboardFilterState', () => ({
  useDashboardFilterState: () => mockUseDashboardFilterState(),
}));

describe('DashboardFilterPanel', () => {
  it('renders owner, date range and stage controls', () => {
    mockUseDashboardFilterState.mockReturnValue({
      filters: {
        owner: null,
        dateRange: null,
        stage: null,
      },
      setOwnerFilter: jest.fn(),
      setDateRangeFilter: jest.fn(),
      setStageFilter: jest.fn(),
    });

    render(<DashboardFilterPanel />);

    fireEvent.click(screen.getByTestId('dashboard-filter-panel-toggle'));

    expect(screen.getByTestId('dashboard-filter-owner-select')).toBeVisible();
    expect(
      screen.getByTestId('dashboard-filter-date-range-select'),
    ).toBeVisible();
    expect(screen.getByTestId('dashboard-filter-stage-select')).toBeVisible();
  });

  it('updates filters when controls change', () => {
    const setOwnerFilter = jest.fn();
    const setDateRangeFilter = jest.fn();
    const setStageFilter = jest.fn();

    mockUseDashboardFilterState.mockReturnValue({
      filters: {
        owner: null,
        dateRange: null,
        stage: null,
      },
      setOwnerFilter,
      setDateRangeFilter,
      setStageFilter,
    });

    render(<DashboardFilterPanel />);

    fireEvent.click(screen.getByTestId('dashboard-filter-panel-toggle'));

    fireEvent.change(screen.getByTestId('dashboard-filter-owner-select'), {
      target: { value: 'John' },
    });

    fireEvent.change(screen.getByTestId('dashboard-filter-date-range-select'), {
      target: { value: 'LAST_30_DAYS' },
    });

    fireEvent.change(screen.getByTestId('dashboard-filter-stage-select'), {
      target: { value: 'Won' },
    });

    expect(setOwnerFilter).toHaveBeenCalledWith('John');
    expect(setDateRangeFilter).toHaveBeenCalledWith('LAST_30_DAYS');
    expect(setStageFilter).toHaveBeenCalledWith('Won');
  });
});
