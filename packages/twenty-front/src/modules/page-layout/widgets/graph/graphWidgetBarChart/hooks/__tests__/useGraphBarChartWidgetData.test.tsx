import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { DashboardFilterBar } from '@/page-layout/components/DashboardFilterBar';
import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { BAR_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/barChartData';
import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { extractBarChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractBarChartDataConfiguration';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { FieldMetadataType } from 'twenty-shared/types';
import {
  AggregateOperations,
  AxisNameDisplay,
  BarChartLayout,
  GraphOrderBy,
  WidgetConfigurationType,
  type BarChartConfiguration,
} from '~/generated-metadata/graphql';

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({
    objectMetadataItem: {
      fields: [
        {
          id: 'name-field-id',
          type: FieldMetadataType.TEXT,
        },
      ],
    },
  }),
}));

const baseConfiguration: BarChartConfiguration = {
  __typename: 'BarChartConfiguration',
  configurationType: WidgetConfigurationType.BAR_CHART,
  layout: BarChartLayout.VERTICAL,
  aggregateOperation: AggregateOperations.COUNT,
  aggregateFieldMetadataId: 'name-field-id',
  primaryAxisGroupByFieldMetadataId: 'name-field-id',
  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
  axisNameDisplay: AxisNameDisplay.BOTH,
  displayDataLabel: false,
};

const baseDataConfiguration =
  extractBarChartDataConfiguration(baseConfiguration);

const createWrapper = (mocks: MockedResponse[]) => {
  return ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <PageLayoutTestWrapper>{children}</PageLayoutTestWrapper>
    </MockedProvider>
  );
};

const GraphWidgetPreview = () => {
  const { data, loading } = useGraphBarChartWidgetData({
    objectMetadataItemId: 'company-object-metadata-id',
    configuration: baseConfiguration,
  });

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <div>
      {data.map((datum) => (
        <span key={String(datum.id)}>{String(datum.id)}</span>
      ))}
    </div>
  );
};

const localFilterConfiguration: BarChartConfiguration = {
  ...baseConfiguration,
  filter: {
    recordFilters: [
      {
        id: 'local-filter-1',
        fieldMetadataId: 'name-field-id',
        value: 'Local',
        displayValue: 'Local',
        operand: 'CONTAINS',
        type: FieldMetadataType.TEXT,
        label: 'Name',
      },
    ],
    recordFilterGroups: [],
  },
};

const LocalFilterGraphWidgetPreview = () => {
  const { data, loading } = useGraphBarChartWidgetData({
    objectMetadataItemId: 'company-object-metadata-id',
    configuration: localFilterConfiguration,
  });

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <div>
      {data.map((datum) => (
        <span key={String(datum.id)}>{String(datum.id)}</span>
      ))}
    </div>
  );
};

describe('useGraphBarChartWidgetData', () => {
  it('should refresh visible widget data when a dashboard text filter is applied', async () => {
    const user = userEvent.setup();

    const mocks: MockedResponse[] = [
      {
        request: {
          query: BAR_CHART_DATA,
          variables: {
            input: {
              objectMetadataId: 'company-object-metadata-id',
              configuration: baseDataConfiguration,
              dashboardGlobalFilters: undefined,
            },
          },
        },
        result: {
          data: {
            barChartData: {
              data: [{ id: 'All companies', totalCount: 12 }],
              indexBy: 'id',
              keys: ['totalCount'],
              series: [{ key: 'totalCount', label: 'Total count' }],
              xAxisLabel: 'Company',
              yAxisLabel: 'Count',
              showLegend: true,
              showDataLabels: false,
              layout: BarChartLayout.VERTICAL,
              groupMode: 'grouped',
              hasTooManyGroups: false,
              formattedToRawLookup: {},
            },
          },
        },
      },
      {
        request: {
          query: BAR_CHART_DATA,
          variables: {
            input: {
              objectMetadataId: 'company-object-metadata-id',
              configuration: baseDataConfiguration,
              dashboardGlobalFilters: {
                recordFilters: [
                  {
                    id: 'dashboard-filter-1',
                    fieldMetadataId: 'name',
                    value: 'Apple',
                    displayValue: 'Apple',
                    operand: 'CONTAINS',
                    type: FieldMetadataType.TEXT,
                    label: 'Name',
                  },
                ],
                recordFilterGroups: [],
              },
            },
          },
        },
        result: {
          data: {
            barChartData: {
              data: [{ id: 'Apple', totalCount: 3 }],
              indexBy: 'id',
              keys: ['totalCount'],
              series: [{ key: 'totalCount', label: 'Total count' }],
              xAxisLabel: 'Company',
              yAxisLabel: 'Count',
              showLegend: true,
              showDataLabels: false,
              layout: BarChartLayout.VERTICAL,
              groupMode: 'grouped',
              hasTooManyGroups: false,
              formattedToRawLookup: {},
            },
          },
        },
      },
      {
        request: {
          query: BAR_CHART_DATA,
          variables: {
            input: {
              objectMetadataId: 'company-object-metadata-id',
              configuration: {
                ...baseDataConfiguration,
                filter: {
                  recordFilters: [
                    {
                      id: 'local-filter-1',
                      fieldMetadataId: 'name-field-id',
                      value: 'Local',
                      displayValue: 'Local',
                      operand: 'CONTAINS',
                      type: FieldMetadataType.TEXT,
                      label: 'Name',
                    },
                  ],
                  recordFilterGroups: [],
                },
              },
              dashboardGlobalFilters: {
                recordFilters: [
                  {
                    id: 'dashboard-filter-1',
                    fieldMetadataId: 'name',
                    value: 'Apple',
                    displayValue: 'Apple',
                    operand: 'CONTAINS',
                    type: FieldMetadataType.TEXT,
                    label: 'Name',
                  },
                ],
                recordFilterGroups: [],
              },
            },
          },
        },
        result: {
          data: {
            barChartData: {
              data: [{ id: 'Apple', totalCount: 3 }],
              indexBy: 'id',
              keys: ['totalCount'],
              series: [{ key: 'totalCount', label: 'Total count' }],
              xAxisLabel: 'Company',
              yAxisLabel: 'Count',
              showLegend: true,
              showDataLabels: false,
              layout: BarChartLayout.VERTICAL,
              groupMode: 'grouped',
              hasTooManyGroups: false,
              formattedToRawLookup: {},
            },
          },
        },
      },
    ];

    render(
      <>
        <DashboardFilterBar />
        <GraphWidgetPreview />
      </>,
      {
        wrapper: createWrapper(mocks),
      },
    );

    await waitFor(() => {
      expect(screen.getByText('All companies')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Add filter' }));
    fireEvent.change(screen.getByLabelText('Value'), {
      target: { value: 'Apple' },
    });
    await user.click(screen.getByRole('button', { name: 'Apply filter' }));

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    expect(screen.queryByText('All companies')).not.toBeInTheDocument();
  });

  it('should ignore dashboard filters when the widget already has local filters', async () => {
    const user = userEvent.setup();

    const mocks: MockedResponse[] = [
      {
        request: {
          query: BAR_CHART_DATA,
          variables: {
            input: {
              objectMetadataId: 'company-object-metadata-id',
              configuration: {
                ...baseDataConfiguration,
                filter: {
                  recordFilters: [
                    {
                      id: 'local-filter-1',
                      fieldMetadataId: 'name-field-id',
                      value: 'Local',
                      displayValue: 'Local',
                      operand: 'CONTAINS',
                      type: FieldMetadataType.TEXT,
                      label: 'Name',
                    },
                  ],
                  recordFilterGroups: [],
                },
              },
              dashboardGlobalFilters: undefined,
            },
          },
        },
        result: {
          data: {
            barChartData: {
              data: [{ id: 'Local only', totalCount: 2 }],
              indexBy: 'id',
              keys: ['totalCount'],
              series: [{ key: 'totalCount', label: 'Total count' }],
              xAxisLabel: 'Company',
              yAxisLabel: 'Count',
              showLegend: true,
              showDataLabels: false,
              layout: BarChartLayout.VERTICAL,
              groupMode: 'grouped',
              hasTooManyGroups: false,
              formattedToRawLookup: {},
            },
          },
        },
      },
      {
        request: {
          query: BAR_CHART_DATA,
          variables: {
            input: {
              objectMetadataId: 'company-object-metadata-id',
              configuration: {
                ...baseDataConfiguration,
                filter: {
                  recordFilters: [
                    {
                      id: 'local-filter-1',
                      fieldMetadataId: 'name-field-id',
                      value: 'Local',
                      displayValue: 'Local',
                      operand: 'CONTAINS',
                      type: FieldMetadataType.TEXT,
                      label: 'Name',
                    },
                  ],
                  recordFilterGroups: [],
                },
              },
              dashboardGlobalFilters: {
                recordFilters: [
                  {
                    id: 'dashboard-filter-1',
                    fieldMetadataId: 'name',
                    value: 'Apple',
                    displayValue: 'Apple',
                    operand: 'CONTAINS',
                    type: FieldMetadataType.TEXT,
                    label: 'Name',
                  },
                ],
                recordFilterGroups: [],
              },
            },
          },
        },
        result: {
          data: {
            barChartData: {
              data: [{ id: 'Local only', totalCount: 2 }],
              indexBy: 'id',
              keys: ['totalCount'],
              series: [{ key: 'totalCount', label: 'Total count' }],
              xAxisLabel: 'Company',
              yAxisLabel: 'Count',
              showLegend: true,
              showDataLabels: false,
              layout: BarChartLayout.VERTICAL,
              groupMode: 'grouped',
              hasTooManyGroups: false,
              formattedToRawLookup: {},
            },
          },
        },
      },
    ];

    render(
      <>
        <DashboardFilterBar />
        <LocalFilterGraphWidgetPreview />
      </>,
      {
        wrapper: createWrapper(mocks),
      },
    );

    await waitFor(() => {
      expect(screen.getByText('Local only')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Add filter' }));
    fireEvent.change(screen.getByLabelText('Value'), {
      target: { value: 'Apple' },
    });
    await user.click(screen.getByRole('button', { name: 'Apply filter' }));

    await waitFor(() => {
      expect(screen.getByText('Local only')).toBeInTheDocument();
    });

    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });
});
