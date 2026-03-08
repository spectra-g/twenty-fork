export const DASHBOARD_DATA_ENDPOINT = '/api/dashboard/data';

export const buildDashboardPayload = ({
  globalFilters = {},
  composedFilters = {},
} = {}) => {
  return {
    globalFilters,
    composedFilters,
  };
};

export const loadDashboardData = async (
  filters,
  fetchImpl = globalThis.fetch,
) => {
  const payload = buildDashboardPayload(filters);

  const response = await fetchImpl(DASHBOARD_DATA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Unable to load dashboard data. Please try again.');
  }

  return response.json();
};
