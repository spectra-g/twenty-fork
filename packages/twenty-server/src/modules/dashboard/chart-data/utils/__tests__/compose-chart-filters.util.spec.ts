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

  it('should let local filters win in the shallow merge stub', () => {
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
              logicalOperator: 'AND',
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
          fieldMetadataId: 'domain',
          operand: 'CONTAINS',
          value: 'twenty.com',
        },
      ],
      recordFilterGroups: [],
    });
  });
});
