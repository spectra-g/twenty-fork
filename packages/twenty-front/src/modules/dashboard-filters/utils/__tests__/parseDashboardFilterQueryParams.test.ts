import { EMPTY_DASHBOARD_FILTERS } from '@/dashboard-filters/states/dashboardFilterState';
import { parseDashboardFilterQueryParams } from '@/dashboard-filters/utils/parseDashboardFilterQueryParams';

describe('parseDashboardFilterQueryParams', () => {
  it('hydrates dashboard filters from filter and filterGroup query params', () => {
    const warningSpy = jest.fn();

    const dashboardFilters = parseDashboardFilterQueryParams({
      searchParams: new URLSearchParams(
        'filter[owner.workspaceMemberId][IS]=%7B%22isCurrentWorkspaceMemberSelected%22%3Afalse%2C%22selectedRecordIds%22%3A%5B%22owner-2%22%5D%7D&filterGroup[operator]=AND&filterGroup[filters][0][field]=closeDate&filterGroup[filters][0][op]=GREATER_THAN_OR_EQUAL&filterGroup[filters][0][value]=2026-02-01&filterGroup[groups][0][operator]=AND&filterGroup[groups][0][filters][0][field]=closeDate&filterGroup[groups][0][filters][0][op]=LESS_THAN_OR_EQUAL&filterGroup[groups][0][filters][0][value]=2026-02-28&filterGroup[groups][0][filters][1][field]=stage&filterGroup[groups][0][filters][1][op]=IS&filterGroup[groups][0][filters][1][value]=NEW',
      ),
      onWarning: warningSpy,
    });

    expect(dashboardFilters).toEqual({
      ownerId: 'owner-2',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      stageId: 'NEW',
    });
    expect(warningSpy).not.toHaveBeenCalled();
  });

  it('ignores malformed dashboard filter query params without crashing', () => {
    const warningSpy = jest.fn();

    const dashboardFilters = parseDashboardFilterQueryParams({
      searchParams: new URLSearchParams(
        'filter[owner.workspaceMemberId][IS]=not-json&filter[stage][IS]=QUALIFIED&filterGroup[operator]=NOT_A_REAL_OPERATOR',
      ),
      onWarning: warningSpy,
    });

    expect(dashboardFilters).toEqual(EMPTY_DASHBOARD_FILTERS);
    expect(warningSpy).toHaveBeenCalled();
  });
});
