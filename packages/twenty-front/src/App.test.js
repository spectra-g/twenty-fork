import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import App from './App';
import { loadDashboardData } from './dashboard/api';

jest.mock('./dashboard/api', () => ({
  ...jest.requireActual('./dashboard/api'),
  loadDashboardData: jest.fn(),
}));

describe('Dashboard App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('renders filter panel, supports selection, and re-renders widgets with composed state', async () => {
    loadDashboardData.mockResolvedValue({ rows: [] });

    render(<App />);

    expect(screen.getByLabelText('global-filter-panel')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'marketing' },
    });

    await waitFor(() => {
      expect(screen.getByText(/\"category\":\"marketing\"/)).toBeInTheDocument();
    });
  });

  it('loads filter state from URL and updates URL when filters change', async () => {
    loadDashboardData.mockResolvedValue({ rows: [] });
    window.history.pushState({}, '', '/?status=open');

    render(<App />);

    expect(screen.getByLabelText('Status')).toHaveValue('open');

    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'closed' },
    });

    await waitFor(() => {
      expect(window.location.search).toContain('status=closed');
    });
  });

  it('root path without params starts with empty filters', async () => {
    loadDashboardData.mockResolvedValue({ rows: [] });

    render(<App />);

    expect(screen.getByLabelText('Category')).toHaveValue('');
    expect(screen.getByLabelText('Status')).toHaveValue('');
    expect(screen.getByLabelText('Date Range')).toHaveValue('');

    await waitFor(() => {
      expect(screen.getByText('{"status":"open"}')).toBeInTheDocument();
      expect(screen.getByText('{"category":"sales"}')).toBeInTheDocument();
    });
  });

  it('runs full flow mount -> url restore -> filter change -> url update -> api call', async () => {
    loadDashboardData.mockResolvedValue({ rows: [1, 2, 3] });

    window.history.pushState({}, '', '/?category=sales');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText('Category')).toHaveValue('sales');
    });

    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'open' },
    });

    await waitFor(() => {
      expect(window.location.search).toContain('status=open');
      expect(loadDashboardData).toHaveBeenCalled();
    });

    const lastCall = loadDashboardData.mock.calls.at(-1);
    expect(lastCall[0]).toEqual(
      expect.objectContaining({
        globalFilters: expect.objectContaining({ category: 'sales', status: 'open' }),
      }),
    );
  });
});
