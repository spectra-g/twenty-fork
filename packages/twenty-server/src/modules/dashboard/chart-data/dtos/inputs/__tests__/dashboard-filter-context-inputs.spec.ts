import { BarChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/bar-chart-data.input';
import { LineChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/line-chart-data.input';
import { PieChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/pie-chart-data.input';

describe('Dashboard chart-data input filter context', () => {
  it('adds dashboard filter context fields to the bar chart input DTO', () => {
    expect(
      Reflect.hasMetadata(
        'design:type',
        BarChartDataInput.prototype,
        'dashboardRecordFilters',
      ),
    ).toBe(true);
    expect(
      Reflect.hasMetadata(
        'design:type',
        BarChartDataInput.prototype,
        'dashboardRecordFilterGroups',
      ),
    ).toBe(true);
  });

  it('adds dashboard filter context fields to the line chart input DTO', () => {
    expect(
      Reflect.hasMetadata(
        'design:type',
        LineChartDataInput.prototype,
        'dashboardRecordFilters',
      ),
    ).toBe(true);
    expect(
      Reflect.hasMetadata(
        'design:type',
        LineChartDataInput.prototype,
        'dashboardRecordFilterGroups',
      ),
    ).toBe(true);
  });

  it('adds dashboard filter context fields to the pie chart input DTO', () => {
    expect(
      Reflect.hasMetadata(
        'design:type',
        PieChartDataInput.prototype,
        'dashboardRecordFilters',
      ),
    ).toBe(true);
    expect(
      Reflect.hasMetadata(
        'design:type',
        PieChartDataInput.prototype,
        'dashboardRecordFilterGroups',
      ),
    ).toBe(true);
  });
});
