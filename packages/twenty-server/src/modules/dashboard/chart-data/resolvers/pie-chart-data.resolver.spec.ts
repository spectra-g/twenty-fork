import type { PieChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/pie-chart-data.input';
import { PieChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/pie-chart-data.resolver';
import type { PieChartDataService } from 'src/modules/dashboard/chart-data/services/pie-chart-data.service';

describe('PieChartDataResolver', () => {
  it('should remain backwards compatible when dashboardGlobalFilters are omitted', async () => {
    const expectedResponse = {
      data: [{ id: 'Active', value: 1 }],
      showLegend: true,
      showDataLabels: false,
      showCenterMetric: false,
      hasTooManyGroups: false,
      formattedToRawLookup: {},
    };
    const getPieChartData = jest.fn().mockResolvedValue(expectedResponse);
    const resolver = new PieChartDataResolver({
      getPieChartData,
    } as unknown as PieChartDataService);

    const input: PieChartDataInput = {
      objectMetadataId: 'object-id',
      configuration: {} as never,
    };

    const result = await resolver.pieChartData(
      input,
      { id: 'workspace-id' } as never,
      { id: 'user-id' } as never,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(result).toEqual(expectedResponse);
    expect(getPieChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataId: 'object-id',
        configuration: input.configuration,
        workspaceId: 'workspace-id',
        dashboardGlobalFilters: undefined,
      }),
    );
  });
});
