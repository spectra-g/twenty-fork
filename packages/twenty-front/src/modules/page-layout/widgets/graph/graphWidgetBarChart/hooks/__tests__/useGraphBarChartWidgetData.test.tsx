import { DashboardFiltersContext } from '@/dashboards/contexts/DashboardFiltersContext';
import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { renderHook } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';

const mockUseQuery = jest.fn();
const mockUseObjectMetadataItemById = jest.fn();

jest.mock('@apollo/client', () => ({
  gql: jest.fn(),
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: (...args: unknown[]) =>
    mockUseObjectMetadataItemById(...args),
}));

describe('useGraphBarChartWidgetData', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseObjectMetadataItemById.mockReturnValue({
      objectMetadataItem: {
        fields: [],
      },
    });

    mockUseQuery.mockReturnValue({
      data: undefined,
      previousData: undefined,
      loading: false,
      error: undefined,
    });
  });

  it('should forward dashboard filters into the bar chart query input', () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <DashboardFiltersContext.Provider
        value={[
          {
            fieldMetadataId: 'owner-field-metadata-id',
            operand: ViewFilterOperand.IS,
            value: '["workspace-member-id"]',
          },
        ]}
      >
        {children}
      </DashboardFiltersContext.Provider>
    );

    renderHook(
      () =>
        useGraphBarChartWidgetData({
          objectMetadataItemId: 'opportunity-object-id',
          configuration: {
            aggregateFieldMetadataId: 'amount-field-metadata-id',
            aggregateOperation: 'COUNT',
            primaryAxisGroupByFieldMetadataId: 'stage-field-metadata-id',
          } as any,
        }),
      { wrapper },
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        variables: {
          input: expect.objectContaining({
            dashboardFilters: [
              {
                fieldMetadataId: 'owner-field-metadata-id',
                operand: ViewFilterOperand.IS,
                value: '["workspace-member-id"]',
              },
            ],
          }),
        },
      }),
    );
  });
});
