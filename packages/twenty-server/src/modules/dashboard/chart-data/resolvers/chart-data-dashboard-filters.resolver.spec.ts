import { Test, type TestingModule } from '@nestjs/testing';

import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { BarChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/bar-chart-data.resolver';
import { LineChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/line-chart-data.resolver';
import { PieChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/pie-chart-data.resolver';
import { BarChartDataService } from 'src/modules/dashboard/chart-data/services/bar-chart-data.service';
import { LineChartDataService } from 'src/modules/dashboard/chart-data/services/line-chart-data.service';
import { PieChartDataService } from 'src/modules/dashboard/chart-data/services/pie-chart-data.service';

const mockBarChartDataService = {
  getBarChartData: jest.fn(),
};

const mockLineChartDataService = {
  getLineChartData: jest.fn(),
};

const mockPieChartDataService = {
  getPieChartData: jest.fn(),
};

describe('Chart data resolvers dashboard filters', () => {
  let barChartDataResolver: BarChartDataResolver;
  let lineChartDataResolver: LineChartDataResolver;
  let pieChartDataResolver: PieChartDataResolver;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BarChartDataResolver,
        LineChartDataResolver,
        PieChartDataResolver,
        {
          provide: BarChartDataService,
          useValue: mockBarChartDataService,
        },
        {
          provide: LineChartDataService,
          useValue: mockLineChartDataService,
        },
        {
          provide: PieChartDataService,
          useValue: mockPieChartDataService,
        },
      ],
    }).compile();

    barChartDataResolver = module.get(BarChartDataResolver);
    lineChartDataResolver = module.get(LineChartDataResolver);
    pieChartDataResolver = module.get(PieChartDataResolver);
  });

  it('should pass dashboardFilters to bar chart service', async () => {
    mockBarChartDataService.getBarChartData.mockResolvedValue({
      data: [],
      indexBy: 'label',
      keys: [],
      series: [],
      xAxisLabel: 'X',
      yAxisLabel: 'Y',
      showLegend: false,
      showDataLabels: false,
      layout: BarChartLayout.VERTICAL,
      groupMode: BarChartGroupMode.GROUPED,
      hasTooManyGroups: false,
      formattedToRawLookup: {},
    });

    const dashboardFilters = [
      {
        fieldMetadataId: 'field-1',
        operand: 'IS',
        value: 'OPEN',
      },
    ];

    await barChartDataResolver.barChartData(
      {
        objectMetadataId: 'object-1',
        configuration: {
          configurationType: WidgetConfigurationType.BAR_CHART,
        },
        dashboardFilters,
      } as never,
      { id: 'workspace-1' } as never,
      { id: 'user-1' } as never,
      'workspace-member-1',
      'user-workspace-1',
    );

    expect(mockBarChartDataService.getBarChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        dashboardFilters,
      }),
    );
  });

  it('should pass dashboardFilters to line chart service', async () => {
    mockLineChartDataService.getLineChartData.mockResolvedValue({
      series: [],
      xAxisLabel: 'X',
      yAxisLabel: 'Y',
      showLegend: false,
      showDataLabels: false,
      hasTooManyGroups: false,
      formattedToRawLookup: {},
    });

    const dashboardFilters = [
      {
        fieldMetadataId: 'field-2',
        operand: 'IS_NOT',
        value: 'CLOSED',
      },
    ];

    await lineChartDataResolver.lineChartData(
      {
        objectMetadataId: 'object-1',
        configuration: {
          configurationType: WidgetConfigurationType.LINE_CHART,
        },
        dashboardFilters,
      } as never,
      { id: 'workspace-1' } as never,
      { id: 'user-1' } as never,
      'workspace-member-1',
      'user-workspace-1',
    );

    expect(mockLineChartDataService.getLineChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        dashboardFilters,
      }),
    );
  });

  it('should pass dashboardFilters to pie chart service', async () => {
    mockPieChartDataService.getPieChartData.mockResolvedValue({
      data: [],
      showLegend: false,
      showDataLabels: false,
      showCenterMetric: false,
      hasTooManyGroups: false,
      formattedToRawLookup: {},
    });

    const dashboardFilters = [
      {
        fieldMetadataId: 'field-3',
        operand: 'CONTAINS',
        value: 'EMEA',
      },
    ];

    await pieChartDataResolver.pieChartData(
      {
        objectMetadataId: 'object-1',
        configuration: {
          configurationType: WidgetConfigurationType.PIE_CHART,
        },
        dashboardFilters,
      } as never,
      { id: 'workspace-1' } as never,
      { id: 'user-1' } as never,
      'workspace-member-1',
      'user-workspace-1',
    );

    expect(mockPieChartDataService.getPieChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        dashboardFilters,
      }),
    );
  });
});
