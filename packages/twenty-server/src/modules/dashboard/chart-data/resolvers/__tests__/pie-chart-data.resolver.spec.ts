import { PieChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/pie-chart-data.resolver';
import { PieChartDataService } from 'src/modules/dashboard/chart-data/services/pie-chart-data.service';

describe('PieChartDataResolver', () => {
  it('forwards optional globalFilter to service', async () => {
    const getPieChartData = jest.fn().mockResolvedValue({});
    const resolver = new PieChartDataResolver({
      getPieChartData,
    } as unknown as PieChartDataService);

    const input = {
      objectMetadataId: 'f92d76e8-a577-43f6-a5f1-31fe455de6f5',
      configuration: { aggregateOperation: 'count' },
      globalFilter: {
        recordFilterGroups: [
          {
            id: 'group-1',
            logicalOperator: 'AND',
          },
        ],
      },
    };

    await resolver.pieChartData(
      input as never,
      { id: 'workspace-id' } as never,
      { id: 'user-id' } as never,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getPieChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataId: input.objectMetadataId,
        configuration: input.configuration,
        dashboardFilter: input.globalFilter,
      }),
    );
  });

  it('keeps compatibility when globalFilter is omitted', async () => {
    const getPieChartData = jest.fn().mockResolvedValue({});
    const resolver = new PieChartDataResolver({
      getPieChartData,
    } as unknown as PieChartDataService);

    const input = {
      objectMetadataId: 'f92d76e8-a577-43f6-a5f1-31fe455de6f5',
      configuration: { aggregateOperation: 'count' },
    };

    await resolver.pieChartData(
      input as never,
      { id: 'workspace-id' } as never,
      { id: 'user-id' } as never,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getPieChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataId: input.objectMetadataId,
        configuration: input.configuration,
        dashboardFilter: undefined,
      }),
    );
  });
});
