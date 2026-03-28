import qs from 'qs';

import { buildDashboardFilterUrlQueryParams } from '@/dashboard-filters/utils/buildDashboardFilterUrlQueryParams';

describe('buildDashboardFilterUrlQueryParams', () => {
  it('serializes applied dashboard filters into the existing filter query param grammar', () => {
    const params = buildDashboardFilterUrlQueryParams({
      ownerId: 'owner-1',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      stageId: 'QUALIFIED',
    });

    expect(qs.parse(params.toString())).toEqual({
      filter: {
        'owner.workspaceMemberId': {
          IS: JSON.stringify({
            isCurrentWorkspaceMemberSelected: false,
            selectedRecordIds: ['owner-1'],
          }),
        },
        closeDate: {
          GREATER_THAN_OR_EQUAL: '2026-03-01',
          LESS_THAN_OR_EQUAL: '2026-03-31',
        },
        stage: {
          IS: 'QUALIFIED',
        },
      },
    });
  });

  it('returns no filter params when there are no applied dashboard filters', () => {
    const params = buildDashboardFilterUrlQueryParams({
      ownerId: '',
      startDate: '',
      endDate: '',
      stageId: '',
    });

    expect(params.toString()).toBe('');
  });
});
