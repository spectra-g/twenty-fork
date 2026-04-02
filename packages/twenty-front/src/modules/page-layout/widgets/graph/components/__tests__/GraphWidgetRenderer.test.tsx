import { render, screen } from '@testing-library/react';

import { DashboardFilterContext } from '@/dashboard/contexts/DashboardFilterContext';
import { GraphWidgetRenderer } from '@/page-layout/widgets/graph/components/GraphWidgetRenderer';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  AggregateOperations,
  BarChartLayout,
  GraphOrderBy,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

jest.mock('@/page-layout/widgets/graph/components/GraphWidget', () => ({
  GraphWidget: () => <div data-testid="graph-widget-chart">chart</div>,
}));
jest.mock('@/views/components/SortOrFilterChip', () => ({
  SortOrFilterChip: ({
    labelKey,
    labelValue,
    testId,
    variant,
  }: {
    labelKey?: string;
    labelValue: string;
    testId?: string;
    variant?: string;
  }) => (
    <div data-testid={testId} data-variant={variant}>
      <span>{labelKey}</span>
      <span>{labelValue}</span>
    </div>
  ),
}));

const localFilter: RecordFilter = {
  id: 'local-filter',
  fieldMetadataId: 'stage-field-id',
  value: 'OPEN',
  displayValue: 'Open',
  operand: RecordFilterOperand.IS,
  type: 'TEXT',
  label: 'Stage',
};

const globalFilter: RecordFilter = {
  id: 'global-filter',
  fieldMetadataId: 'status-field-id',
  value: 'OPEN',
  displayValue: 'Open',
  operand: RecordFilterOperand.IS,
  type: 'TEXT',
  label: 'Status',
};

const widget: PageLayoutWidget = {
  __typename: 'PageLayoutWidget',
  id: 'widget-1',
  title: 'Pipeline by Stage',
  type: WidgetType.GRAPH,
  objectMetadataId: 'opportunity-object-id',
  pageLayoutTabId: 'tab-1',
  createdAt: '2026-04-02T00:00:00.000Z',
  updatedAt: '2026-04-02T00:00:00.000Z',
  deletedAt: null,
  gridPosition: {
    row: 0,
    column: 0,
    rowSpan: 4,
    columnSpan: 6,
  },
  configuration: {
    __typename: 'BarChartConfiguration',
    configurationType: WidgetConfigurationType.BAR_CHART,
    aggregateFieldMetadataId: 'amount-field-id',
    aggregateOperation: AggregateOperations.COUNT,
    primaryAxisGroupByFieldMetadataId: 'stage-field-id',
    primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
    layout: BarChartLayout.VERTICAL,
    filter: {
      recordFilters: [localFilter],
      recordFilterGroups: [],
    },
  },
};

const renderGraphWidgetRenderer = (globalFilters: RecordFilter[]) =>
  render(
    <DashboardFilterContext.Provider
      value={{
        globalFilters,
        globalFilterGroups: [],
        presets: [],
        setGlobalFilters: jest.fn(),
        setGlobalFilterGroups: jest.fn(),
        setPresets: jest.fn(),
      }}
    >
      <GraphWidgetRenderer widget={widget} />
    </DashboardFilterContext.Provider>,
  );

describe('GraphWidgetRenderer', () => {
  it('renders separate global and local filter pill groups with distinct variants', () => {
    renderGraphWidgetRenderer([globalFilter]);

    expect(screen.getByTestId('graph-widget-global-filter-group')).toBeVisible();
    expect(screen.getByTestId('graph-widget-local-filter-group')).toBeVisible();
    expect(screen.getByTestId('graph-widget-global-filter-0')).toHaveAttribute(
      'data-variant',
      'light',
    );
    expect(screen.getByTestId('graph-widget-local-filter-0')).toHaveAttribute(
      'data-variant',
      'default',
    );
    expect(screen.getByText('Global filters')).toBeVisible();
    expect(screen.getByText('Widget filters')).toBeVisible();
    expect(screen.getByTestId('graph-widget-global-filter-0')).toHaveTextContent(
      'Status: Open',
    );
    expect(screen.getAllByText('Open')).toHaveLength(2);
  });

  it('preserves widget-local pills when a global filter is applied', () => {
    const { rerender } = renderGraphWidgetRenderer([]);

    expect(screen.getByTestId('graph-widget-local-filter-group')).toBeVisible();
    expect(
      screen.queryByTestId('graph-widget-global-filter-group'),
    ).not.toBeInTheDocument();

    rerender(
      <DashboardFilterContext.Provider
        value={{
          globalFilters: [globalFilter],
          globalFilterGroups: [],
          presets: [],
          setGlobalFilters: jest.fn(),
          setGlobalFilterGroups: jest.fn(),
          setPresets: jest.fn(),
        }}
      >
        <GraphWidgetRenderer widget={widget} />
      </DashboardFilterContext.Provider>,
    );

    expect(screen.getByTestId('graph-widget-local-filter-group')).toContainElement(
      screen.getByTestId('graph-widget-local-filter-0'),
    );
    expect(screen.getByTestId('graph-widget-local-filter-0')).toHaveTextContent(
      'Stage: Open',
    );
    expect(screen.getByTestId('graph-widget-global-filter-group')).toBeVisible();
  });

  it('removes only global pills when global filters are cleared', () => {
    const { rerender } = renderGraphWidgetRenderer([globalFilter]);

    expect(screen.getByTestId('graph-widget-global-filter-group')).toBeVisible();
    expect(screen.getByTestId('graph-widget-local-filter-group')).toBeVisible();

    rerender(
      <DashboardFilterContext.Provider
        value={{
          globalFilters: [],
          globalFilterGroups: [],
          presets: [],
          setGlobalFilters: jest.fn(),
          setGlobalFilterGroups: jest.fn(),
          setPresets: jest.fn(),
        }}
      >
        <GraphWidgetRenderer widget={widget} />
      </DashboardFilterContext.Provider>,
    );

    expect(
      screen.queryByTestId('graph-widget-global-filter-group'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('graph-widget-local-filter-group')).toBeVisible();
    expect(screen.getByTestId('graph-widget-local-filter-0')).toHaveTextContent(
      'Stage: Open',
    );
  });
});
