import type { LineChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/line-chart-data.input';
import { LineChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/line-chart-data.resolver';
import type { LineChartDataService } from 'src/modules/dashboard/chart-data/services/line-chart-data.service';

describe('LineChartDataResolver', () => {
  it('should pass dashboardGlobalFilters to the service layer', async () => {
    const getLineChartData = jest.fn().mockResolvedValue({
      series: [],
      xAxisLabel: '',
      yAxisLabel: '',
      showLegend: true,
      showDataLabels: false,
      hasTooManyGroups: false,
      formattedToRawLookup: {},
    });
    const resolver = new LineChartDataResolver({
      getLineChartData,
    } as unknown as LineChartDataService);

    const input: LineChartDataInput = {
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

    await resolver.lineChartData(
      input,
      { id: 'workspace-id' } as never,
      { id: 'user-id' } as never,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getLineChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataId: 'object-id',
        configuration: input.configuration,
        workspaceId: 'workspace-id',
        dashboardGlobalFilters: input.dashboardGlobalFilters,
      }),
    );
  });
});
