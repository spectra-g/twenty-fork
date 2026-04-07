import { getGraphWidgetConfigurationWithDashboardFilters } from '@/page-layout/widgets/graph/utils/getGraphWidgetConfigurationWithDashboardFilters';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

describe('getGraphWidgetConfigurationWithDashboardFilters', () => {
  it('should merge widget-local filters with dashboard filters using AND semantics', () => {
    const localFilter = {
      id: 'local-filter',
      fieldMetadataId: 'status-field-id',
      operand: ViewFilterOperand.IS,
      type: FieldMetadataType.SELECT,
      value: 'ACTIVE',
    };
    const dashboardFilter = {
      id: 'dashboard-filter',
      fieldMetadataId: 'owner-field-id',
      operand: ViewFilterOperand.IS,
      type: FieldMetadataType.UUID,
      value: '4f83d5c0-7c7a-4f67-9f29-0a6aad1f4eb1',
    };

    const configuration = {
      __typename: 'BarChartConfiguration',
      configurationType: WidgetConfigurationType.BAR_CHART,
      aggregateFieldMetadataId: 'aggregate-field-id',
      filter: {
        recordFilters: [localFilter],
        recordFilterGroups: [],
      },
    } as const;

    const result = getGraphWidgetConfigurationWithDashboardFilters(
      configuration,
      {
        recordFilters: [dashboardFilter],
        recordFilterGroups: [],
      },
    );

    expect(result.filter).toEqual({
      recordFilters: [localFilter, dashboardFilter],
      recordFilterGroups: [],
    });
  });

  it('should use dashboard filters when the widget has no local filters', () => {
    const dashboardFilter = {
      id: 'dashboard-filter',
      fieldMetadataId: 'owner-field-id',
      operand: ViewFilterOperand.IS,
      type: FieldMetadataType.UUID,
      value: '4f83d5c0-7c7a-4f67-9f29-0a6aad1f4eb1',
    };

    const configuration = {
      __typename: 'PieChartConfiguration',
      configurationType: WidgetConfigurationType.PIE_CHART,
      aggregateFieldMetadataId: 'aggregate-field-id',
      filter: null,
    } as const;

    const result = getGraphWidgetConfigurationWithDashboardFilters(
      configuration,
      {
        recordFilters: [dashboardFilter],
        recordFilterGroups: [],
      },
    );

    expect(result.filter).toEqual({
      recordFilters: [dashboardFilter],
      recordFilterGroups: [],
    });
  });

  it('should preserve widget-local filters when dashboard filters are cleared', () => {
    const localFilter = {
      id: 'local-filter',
      fieldMetadataId: 'status-field-id',
      operand: ViewFilterOperand.IS,
      type: FieldMetadataType.SELECT,
      value: 'ACTIVE',
    };

    const configuration = {
      __typename: 'LineChartConfiguration',
      configurationType: WidgetConfigurationType.LINE_CHART,
      aggregateFieldMetadataId: 'aggregate-field-id',
      filter: {
        recordFilters: [localFilter],
        recordFilterGroups: [],
      },
    } as const;

    const result = getGraphWidgetConfigurationWithDashboardFilters(
      configuration,
      {
        recordFilters: [],
        recordFilterGroups: [],
      },
    );

    expect(result.filter).toEqual({
      recordFilters: [localFilter],
      recordFilterGroups: [],
    });
    expect(result.filter).not.toBe(configuration.filter);
    expect(configuration.filter).toEqual({
      recordFilters: [localFilter],
      recordFilterGroups: [],
    });
  });
});
