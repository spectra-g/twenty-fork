import { BarChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/bar-chart-data.resolver';
import { BarChartDataService } from 'src/modules/dashboard/chart-data/services/bar-chart-data.service';

describe('BarChartDataResolver', () => {
  it('forwards optional dashboardFilter to service', async () => {
    const getBarChartData = jest.fn().mockResolvedValue({});
    const resolver = new BarChartDataResolver({
      getBarChartData,
    } as unknown as BarChartDataService);

    const input = {
      objectMetadataId: 'f92d76e8-a577-43f6-a5f1-31fe455de6f5',
      configuration: { aggregateOperation: 'count' },
      dashboardFilter: {
        recordFilters: [
          {
            fieldMetadataId: 'account:status',
            operand: 'eq',
            value: 'ACTIVE',
          },
        ],
        recordFilterGroups: [
          {
            id: 'group-1',
            logicalOperator: 'AND',
          },
        ],
      },
    };

    const workspace = {
      id: 'workspace-id',
    };

    await resolver.barChartData(
      input as never,
      workspace as never,
      { id: 'user-id' } as never,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getBarChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataId: input.objectMetadataId,
        configuration: input.configuration,
        workspaceId: workspace.id,
        dashboardFilter: input.dashboardFilter,
      }),
    );
  });

  it('keeps compatibility when dashboardFilter is omitted', async () => {
    const getBarChartData = jest.fn().mockResolvedValue({});
    const resolver = new BarChartDataResolver({
      getBarChartData,
    } as unknown as BarChartDataService);

    const input = {
      objectMetadataId: 'f92d76e8-a577-43f6-a5f1-31fe455de6f5',
      configuration: { aggregateOperation: 'count' },
    };

    await resolver.barChartData(
      input as never,
      { id: 'workspace-id' } as never,
      { id: 'user-id' } as never,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getBarChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataId: input.objectMetadataId,
        configuration: input.configuration,
        dashboardFilter: undefined,
      }),
    );
  });

  it('normalizes null dashboardFilter to undefined for compatibility', async () => {
    const getBarChartData = jest.fn().mockResolvedValue({});
    const resolver = new BarChartDataResolver({
      getBarChartData,
    } as unknown as BarChartDataService);

    const input = {
      objectMetadataId: 'f92d76e8-a577-43f6-a5f1-31fe455de6f5',
      configuration: { aggregateOperation: 'count' },
      dashboardFilter: null,
    };

    await resolver.barChartData(
      input as never,
      { id: 'workspace-id' } as never,
      { id: 'user-id' } as never,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getBarChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        dashboardFilter: undefined,
      }),
    );
  });
});
