import { BarChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/bar-chart-data.resolver';
import { LineChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/line-chart-data.resolver';
import { PieChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/pie-chart-data.resolver';

describe('Dashboard chart-data resolvers', () => {
  const workspace = { id: 'workspace-id' } as any;
  const user = { id: 'user-id' } as any;

  it('passes dashboard filter context from the bar chart input to the service layer', async () => {
    const getBarChartData = jest.fn().mockResolvedValue({ data: [] });
    const resolver = new BarChartDataResolver({
      getBarChartData,
    } as any);

    await resolver.barChartData(
      {
        objectMetadataId: 'object-id',
        configuration: { filter: { recordFilters: [] } },
        dashboardRecordFilters: [
          {
            fieldMetadataId: 'status-field-id',
            operand: 'is',
            value: 'active',
          },
        ],
        dashboardRecordFilterGroups: [],
      } as any,
      workspace,
      user,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getBarChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        dashboardFilter: {
          recordFilters: [
            {
              fieldMetadataId: 'status-field-id',
              operand: 'is',
              value: 'active',
            },
          ],
          recordFilterGroups: [],
        },
      }),
    );
  });

  it('passes dashboard filter context from the line chart input to the service layer', async () => {
    const getLineChartData = jest.fn().mockResolvedValue({ series: [] });
    const resolver = new LineChartDataResolver({
      getLineChartData,
    } as any);

    await resolver.lineChartData(
      {
        objectMetadataId: 'object-id',
        configuration: { filter: { recordFilters: [] } },
        dashboardRecordFilters: [
          {
            fieldMetadataId: 'status-field-id',
            operand: 'is',
            value: 'active',
          },
        ],
        dashboardRecordFilterGroups: [],
      } as any,
      workspace,
      user,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getLineChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        dashboardFilter: {
          recordFilters: [
            {
              fieldMetadataId: 'status-field-id',
              operand: 'is',
              value: 'active',
            },
          ],
          recordFilterGroups: [],
        },
      }),
    );
  });

  it('passes dashboard filter context from the pie chart input to the service layer', async () => {
    const getPieChartData = jest.fn().mockResolvedValue({ data: [] });
    const resolver = new PieChartDataResolver({
      getPieChartData,
    } as any);

    await resolver.pieChartData(
      {
        objectMetadataId: 'object-id',
        configuration: { filter: { recordFilters: [] } },
        dashboardRecordFilters: [
          {
            fieldMetadataId: 'status-field-id',
            operand: 'is',
            value: 'active',
          },
        ],
        dashboardRecordFilterGroups: [],
      } as any,
      workspace,
      user,
      'workspace-member-id',
      'user-workspace-id',
    );

    expect(getPieChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        dashboardFilter: {
          recordFilters: [
            {
              fieldMetadataId: 'status-field-id',
              operand: 'is',
              value: 'active',
            },
          ],
          recordFilterGroups: [],
        },
      }),
    );
  });
});
