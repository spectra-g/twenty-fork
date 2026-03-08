import {
  DASHBOARD_DATA_ENDPOINT,
  buildDashboardPayload,
  loadDashboardData,
} from './api';

describe('dashboard api client', () => {
  it('builds expected payload shape', () => {
    const payload = buildDashboardPayload({
      globalFilters: { category: 'sales' },
      composedFilters: { category: 'sales', status: 'open' },
    });

    expect(payload).toEqual({
      globalFilters: { category: 'sales' },
      composedFilters: { category: 'sales', status: 'open' },
    });
  });

  it('sends composed filter payload to backend endpoint', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    await loadDashboardData(
      {
        globalFilters: { category: 'marketing' },
        composedFilters: { category: 'marketing', status: 'closed' },
      },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledWith(DASHBOARD_DATA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        globalFilters: { category: 'marketing' },
        composedFilters: { category: 'marketing', status: 'closed' },
      }),
    });
  });

  it('throws user-friendly error for failed responses', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'failed' }),
    });

    await expect(
      loadDashboardData(
        {
          globalFilters: {},
          composedFilters: {},
        },
        fetchMock,
      ),
    ).rejects.toThrow('Unable to load dashboard data. Please try again.');
  });
});
