import { render, screen } from '@testing-library/react';
import { WidgetType } from '~/generated-metadata/graphql';

import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { type DashboardWidgetFilter } from '@/page-layout/widgets/utils/mergeWidgetFilters';

jest.mock('@/page-layout/widgets/graph/components/GraphWidgetRenderer', () => ({
  GraphWidgetRenderer: ({
    dashboardFilters,
  }: {
    dashboardFilters: DashboardWidgetFilter[];
  }) => (
    <div data-testid="graph-widget-renderer">
      {JSON.stringify(dashboardFilters)}
    </div>
  ),
}));

const dashboardFilters: DashboardWidgetFilter[] = [
  {
    dimension: 'owner',
    filter: {
      recordFilters: [
        {
          fieldMetadataId: 'created-by-field',
          operand: 'is',
          value: '["owner-1"]',
          subFieldName: 'workspaceMemberId',
        },
      ],
    },
  },
];

describe('WidgetContentRenderer', () => {
  it('passes dashboard filters to graph widgets', () => {
    render(
      <WidgetContentRenderer
        widget={{ id: 'widget-1', type: WidgetType.GRAPH } as any}
        dashboardFilters={dashboardFilters}
      />,
    );

    expect(screen.getByTestId('graph-widget-renderer')).toHaveTextContent(
      'owner',
    );
  });

  it('renders unknown widget types without throwing', () => {
    const renderUnknownWidget = () =>
      render(
        <WidgetContentRenderer
          widget={{ id: 'widget-2', type: 'UNKNOWN_WIDGET_TYPE' } as any}
          dashboardFilters={dashboardFilters}
        />,
      );

    expect(renderUnknownWidget).not.toThrow();
  });
});
