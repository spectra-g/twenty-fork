import { type DashboardFilters } from '@/dashboard-filters/states/dashboardFilterState';
import { buildDashboardFilterQuery } from '@/dashboard-filters/utils/buildDashboardFilterQuery';
import { ViewFilterOperand } from 'twenty-shared/types';

const dashboardFilters: DashboardFilters = {
  ownerId: 'owner-1',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  stageId: 'NEW',
};

describe('buildDashboardFilterQuery', () => {
  it('builds chart filters for owner, date range, and stage', () => {
    const filter = buildDashboardFilterQuery({
      dashboardFilters,
      fields: [
        { id: 'owner-field-id', name: 'owner' },
        { id: 'close-date-field-id', name: 'closeDate' },
        { id: 'stage-field-id', name: 'stage' },
      ],
    });

    expect(filter).toEqual({
      recordFilters: [
        {
          fieldMetadataId: 'owner-field-id',
          operand: ViewFilterOperand.IS,
          subFieldName: 'workspaceMemberId',
          value: JSON.stringify({
            isCurrentWorkspaceMemberSelected: false,
            selectedRecordIds: ['owner-1'],
          }),
        },
        {
          fieldMetadataId: 'close-date-field-id',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '2026-01-01',
        },
        {
          fieldMetadataId: 'close-date-field-id',
          operand: ViewFilterOperand.LESS_THAN_OR_EQUAL,
          value: '2026-01-31',
        },
        {
          fieldMetadataId: 'stage-field-id',
          operand: ViewFilterOperand.IS,
          value: 'NEW',
        },
      ],
    });
  });

  it('falls back to createdAt and omits filters that cannot be resolved from metadata', () => {
    const filter = buildDashboardFilterQuery({
      dashboardFilters: {
        ownerId: '',
        startDate: '2026-02-01',
        endDate: '2026-02-10',
        stageId: 'QUALIFIED',
      },
      fields: [
        { id: 'created-at-field-id', name: 'createdAt' },
      ],
    });

    expect(filter).toEqual({
      recordFilters: [
        {
          fieldMetadataId: 'created-at-field-id',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '2026-02-01',
        },
        {
          fieldMetadataId: 'created-at-field-id',
          operand: ViewFilterOperand.LESS_THAN_OR_EQUAL,
          value: '2026-02-10',
        },
      ],
    });
  });
});
