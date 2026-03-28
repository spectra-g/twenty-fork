import type { BarChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/bar-chart-data.input';
import { BarChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/bar-chart-data.resolver';
import type { BarChartDataService } from 'src/modules/dashboard/chart-data/services/bar-chart-data.service';

describe('BarChartDataResolver', () => {
  it('should pass dashboardGlobalFilters to the service layer', async () => {
    const getBarChartData = jest.fn().mockResolvedValue({
      data: [],
      indexBy: 'id',
      keys: [],
      series: [],
      xAxisLabel: '',
      yAxisLabel: '',
      showLegend: true,
      showDataLabels: false,
      layout: 'vertical',
      groupMode: 'grouped',
      hasTooManyGroups: false,
      formattedToRawLookup: {},
    });
    const resolver = new BarChartDataResolver({
      getBarChartData,
    } as unknown as BarChartDataService);

    const input: BarChartDataInput = {
      objectMetadataId: 'object-id',
      configuration: {} as never,
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
    };

    await resolver.barChartData(
      input,
      { id: 'workspace-id' } as never,
      { id: 'user-id' } as never,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getBarChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataId: 'object-id',
        configuration: input.configuration,
        workspaceId: 'workspace-id',
        dashboardGlobalFilters: input.dashboardGlobalFilters,
      }),
    );
  });
});
