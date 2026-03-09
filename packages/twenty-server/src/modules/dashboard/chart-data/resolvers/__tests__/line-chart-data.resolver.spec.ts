import { LineChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/line-chart-data.resolver';
import { LineChartDataService } from 'src/modules/dashboard/chart-data/services/line-chart-data.service';

describe('LineChartDataResolver', () => {
  it('forwards optional globalFilter to service', async () => {
    const getLineChartData = jest.fn().mockResolvedValue({});
    const resolver = new LineChartDataResolver({
      getLineChartData,
    } as unknown as LineChartDataService);

    const input = {
      objectMetadataId: 'f92d76e8-a577-43f6-a5f1-31fe455de6f5',
      configuration: { aggregateOperation: 'count' },
      globalFilter: {
        recordFilters: [
          {
            fieldMetadataId: 'account:status',
            operand: 'eq',
            value: 'ACTIVE',
          },
        ],
      },
    };

    await resolver.lineChartData(
      input as never,
      { id: 'workspace-id' } as never,
      { id: 'user-id' } as never,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getLineChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataId: input.objectMetadataId,
        configuration: input.configuration,
        dashboardFilter: input.globalFilter,
      }),
    );
  });

  it('keeps compatibility when globalFilter is omitted', async () => {
    const getLineChartData = jest.fn().mockResolvedValue({});
    const resolver = new LineChartDataResolver({
      getLineChartData,
    } as unknown as LineChartDataService);

    const input = {
      objectMetadataId: 'f92d76e8-a577-43f6-a5f1-31fe455de6f5',
      configuration: { aggregateOperation: 'count' },
    };

    await resolver.lineChartData(
      input as never,
      { id: 'workspace-id' } as never,
      { id: 'user-id' } as never,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getLineChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataId: input.objectMetadataId,
        configuration: input.configuration,
        dashboardFilter: undefined,
      }),
    );
  });
});
