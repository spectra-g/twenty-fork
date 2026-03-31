import { getEmptyDashboardFiltersState } from '@/dashboards/states/dashboardFiltersAtom';
import { buildDashboardFilterQueryParams } from '@/dashboards/utils/buildDashboardFilterQueryParams';

describe('buildDashboardFilterQueryParams', () => {
  it('returns dashboard filter query params for populated filters', () => {
    expect(
      buildDashboardFilterQueryParams({
        pageLayoutId: 'page-layout-id',
        ownerId: 'owner-id',
        ownerLabel: 'John Wick',
        startDate: '2026-03-01',
        endDate: '2026-03-15',
        stage: 'Proposal',
        refreshCount: 2,
      }),
    ).toEqual({
      'dashboardFilter[endDate]': '2026-03-15',
      'dashboardFilter[ownerId]': 'owner-id',
      'dashboardFilter[startDate]': '2026-03-01',
      'dashboardFilter[stage]': 'Proposal',
    });
  });

  it('omits empty dashboard filters', () => {
    expect(
      buildDashboardFilterQueryParams(getEmptyDashboardFiltersState('page-layout-id')),
    ).toEqual({});
  });
});
