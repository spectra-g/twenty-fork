import { composeChartFilters } from 'src/modules/dashboard/chart-data/utils/compose-chart-filters.util';

describe('composeChartFilters', () => {
  it('should return undefined when both filter sources are omitted', () => {
    expect(
      composeChartFilters({
        dashboardGlobalFilters: undefined,
        localFilters: undefined,
      }),
    ).toBeUndefined();
  });

  it('should keep dashboard global filters when no local filter is provided', () => {
    expect(
      composeChartFilters({
        dashboardGlobalFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'name',
              operand: 'CONTAINS',
              value: 'Apple',
            },
          ],
          recordFilterGroups: [],
        },
      }),
    ).toEqual({
      recordFilters: [
        {
          fieldMetadataId: 'name',
          operand: 'CONTAINS',
          value: 'Apple',
        },
      ],
      recordFilterGroups: [],
    });
  });

  it('should keep local filters when dashboard global filters are omitted', () => {
    expect(
      composeChartFilters({
        localFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'domain',
              operand: 'CONTAINS',
              value: 'twenty.com',
            },
          ],
          recordFilterGroups: [],
        },
      }),
    ).toEqual({
      recordFilters: [
        {
          fieldMetadataId: 'domain',
          operand: 'CONTAINS',
          value: 'twenty.com',
        },
      ],
      recordFilterGroups: [],
    });
  });

  it('should intersect local and dashboard global filters with an AND root group', () => {
    expect(
      composeChartFilters({
        dashboardGlobalFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'name',
              operand: 'CONTAINS',
              value: 'Apple',
            },
          ],
          recordFilterGroups: [
            {
              id: 'global-group',
              logicalOperator: 'OR',
            },
          ],
        },
        localFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'domain',
              operand: 'CONTAINS',
              value: 'twenty.com',
            },
          ],
          recordFilterGroups: [],
        },
      }),
    ).toEqual({
      recordFilters: [
        {
          fieldMetadataId: 'name',
          operand: 'CONTAINS',
          value: 'Apple',
          recordFilterGroupId: 'dashboard-global-and-local-root-group',
        },
        {
          fieldMetadataId: 'domain',
          operand: 'CONTAINS',
          value: 'twenty.com',
          recordFilterGroupId: 'dashboard-global-and-local-root-group',
        },
      ],
      recordFilterGroups: [
        {
          id: 'dashboard-global-and-local-root-group',
          logicalOperator: 'AND',
        },
        {
          id: 'dashboard-global-global-group',
          logicalOperator: 'OR',
          parentRecordFilterGroupId: 'dashboard-global-and-local-root-group',
        },
      ],
    });
  });

  it('should preserve date filter values when composing timezone-sensitive filters', () => {
    expect(
      composeChartFilters({
        dashboardGlobalFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'created-at',
              operand: 'IS_AFTER',
              value: '2024-03-31T06:30:00.000Z',
            },
          ],
          recordFilterGroups: [],
        },
        localFilters: {
          recordFilters: [
            {
              fieldMetadataId: 'created-at',
              operand: 'IS',
              value: '2024-03-30',
            },
          ],
          recordFilterGroups: [],
        },
      }),
    ).toEqual({
      recordFilters: [
        {
          fieldMetadataId: 'created-at',
          operand: 'IS_AFTER',
          value: '2024-03-31T06:30:00.000Z',
          recordFilterGroupId: 'dashboard-global-and-local-root-group',
        },
        {
          fieldMetadataId: 'created-at',
          operand: 'IS',
          value: '2024-03-30',
          recordFilterGroupId: 'dashboard-global-and-local-root-group',
        },
      ],
      recordFilterGroups: [
        {
          id: 'dashboard-global-and-local-root-group',
          logicalOperator: 'AND',
        },
      ],
    });
  });
});
