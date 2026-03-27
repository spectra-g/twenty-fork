import {
  buildDashboardUrlSearchParams,
  resolveDashboardUrlState,
} from '@/dashboards/hooks/useDashboardUrlState';

describe('useDashboardUrlState helpers', () => {
  it('should prefer a resolved preset over raw stage filters from the URL', () => {
    const result = resolveDashboardUrlState({
      search: '?presetId=sales-stage-preset-123&filter[stage][eq]=Open',
    });

    expect(result.presetId).toBe('sales-stage-preset-123');
    expect(result.restoredPreset?.name).toBe('Sales View');
    expect(result.stageFilter).toEqual({
      value: 'closed-won',
      label: 'Closed Won',
    });
  });

  it('should serialize a selected preset without carrying raw filters into the URL', () => {
    const searchParams = buildDashboardUrlSearchParams({
      presetId: 'sales-stage-preset-123',
      rawFilters: {
        stage: {
          eq: 'Open',
        },
      },
    });

    expect(searchParams.toString()).toBe('presetId=sales-stage-preset-123');
  });
});
