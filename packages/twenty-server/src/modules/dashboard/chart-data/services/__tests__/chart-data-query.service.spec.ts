import { Test, type TestingModule } from '@nestjs/testing';

import { CalendarStartDay } from 'twenty-shared/constants';
import {
  AggregateOperations,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { combineFilters } from 'twenty-shared/utils';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';
import { convertChartFilterToGqlOperationFilter } from 'src/modules/dashboard/chart-data/utils/convert-chart-filter-to-gql-operation-filter.util';

describe('ChartDataQueryService', () => {
  let service: ChartDataQueryService;
  let mockExecute: jest.Mock;

  const flatObjectMetadata = {
    id: 'object-id',
    nameSingular: 'company',
    fieldIds: [
      'group-by-field-id',
      'aggregate-field-id',
      'status-field-id',
      'priority-field-id',
    ],
  };

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: {
      'group-by-field-universal-id': {
        id: 'group-by-field-id',
        universalIdentifier: 'group-by-field-universal-id',
        name: 'stage',
        label: 'Stage',
        type: FieldMetadataType.TEXT,
      },
      'aggregate-field-universal-id': {
        id: 'aggregate-field-id',
        universalIdentifier: 'aggregate-field-universal-id',
        name: 'amount',
        label: 'Amount',
        type: FieldMetadataType.NUMBER,
      },
      'status-field-universal-id': {
        id: 'status-field-id',
        universalIdentifier: 'status-field-universal-id',
        name: 'status',
        label: 'Status',
        type: FieldMetadataType.TEXT,
      },
      'priority-field-universal-id': {
        id: 'priority-field-id',
        universalIdentifier: 'priority-field-universal-id',
        name: 'priority',
        label: 'Priority',
        type: FieldMetadataType.TEXT,
      },
    },
    universalIdentifierById: {
      'group-by-field-id': 'group-by-field-universal-id',
      'aggregate-field-id': 'aggregate-field-universal-id',
      'status-field-id': 'status-field-universal-id',
      'priority-field-id': 'priority-field-universal-id',
    },
    universalIdentifiersByApplicationId: {},
  };

  const flatObjectMetadataMaps = {
    byUniversalIdentifier: {
      'object-universal-id': {
        ...flatObjectMetadata,
        universalIdentifier: 'object-universal-id',
      },
    },
    universalIdentifierById: {
      'object-id': 'object-universal-id',
    },
    universalIdentifiersByApplicationId: {},
  };

  beforeEach(async () => {
    mockExecute = jest.fn().mockResolvedValue([
      {
        groupByDimensionValues: ['Active'],
        countId: 1,
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartDataQueryService,
        {
          provide: CommonGroupByQueryRunnerService,
          useValue: {
            execute: mockExecute,
          },
        },
      ],
    }).compile();

    service = module.get<ChartDataQueryService>(ChartDataQueryService);
  });

  it('combines dashboard-level and widget-level filters with AND semantics before querying', async () => {
    const widgetFilter = {
      recordFilters: [
        {
          id: 'widget-filter-id',
          fieldMetadataId: 'priority-field-id',
          operand: ViewFilterOperand.CONTAINS,
          value: 'high',
          type: FieldMetadataType.TEXT,
        },
      ],
      recordFilterGroups: [],
    };
    const dashboardFilter = {
      recordFilters: [
        {
          id: 'dashboard-filter-id',
          fieldMetadataId: 'status-field-id',
          operand: ViewFilterOperand.CONTAINS,
          value: 'active',
          type: FieldMetadataType.TEXT,
        },
      ],
      recordFilterGroups: [],
    };

    await service.executeGroupByQuery({
      flatObjectMetadata: flatObjectMetadata as any,
      flatFieldMetadataMaps: flatFieldMetadataMaps as any,
      flatObjectMetadataMaps: flatObjectMetadataMaps as any,
      objectIdByNameSingular: { company: 'object-id' },
      authContext: { workspace: { id: 'workspace-id' } } as any,
      groupByFieldMetadataId: 'group-by-field-id',
      aggregateFieldMetadataId: 'aggregate-field-id',
      aggregateOperation: AggregateOperations.COUNT,
      filter: widgetFilter as any,
      dashboardFilter: dashboardFilter as any,
      userTimezone: 'UTC',
      firstDayOfTheWeek: CalendarStartDay.MONDAY,
      limit: 10,
      primaryAxisOrderBy: GraphOrderBy.VALUE_ASC,
    });

    const expectedDashboardFilter = convertChartFilterToGqlOperationFilter({
      filter: dashboardFilter as any,
      flatObjectMetadata: flatObjectMetadata as any,
      flatFieldMetadataMaps: flatFieldMetadataMaps as any,
      userTimezone: 'UTC',
    });
    const expectedWidgetFilter = convertChartFilterToGqlOperationFilter({
      filter: widgetFilter as any,
      flatObjectMetadata: flatObjectMetadata as any,
      flatFieldMetadataMaps: flatFieldMetadataMaps as any,
      userTimezone: 'UTC',
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: combineFilters([expectedDashboardFilter, expectedWidgetFilter]),
      }),
      expect.any(Object),
    );
  });

  it('does not mutate the widget-local filter object while composing dashboard filters', async () => {
    const widgetFilter = {
      recordFilters: [
        {
          id: 'widget-filter-id',
          fieldMetadataId: 'priority-field-id',
          operand: ViewFilterOperand.CONTAINS,
          value: 'high',
          type: FieldMetadataType.TEXT,
        },
      ],
      recordFilterGroups: [],
    };
    const dashboardFilter = {
      recordFilters: [
        {
          id: 'dashboard-filter-id',
          fieldMetadataId: 'status-field-id',
          operand: ViewFilterOperand.CONTAINS,
          value: 'active',
          type: FieldMetadataType.TEXT,
        },
      ],
      recordFilterGroups: [],
    };
    const widgetFilterBeforeExecution = structuredClone(widgetFilter);

    await service.executeGroupByQuery({
      flatObjectMetadata: flatObjectMetadata as any,
      flatFieldMetadataMaps: flatFieldMetadataMaps as any,
      flatObjectMetadataMaps: flatObjectMetadataMaps as any,
      objectIdByNameSingular: { company: 'object-id' },
      authContext: { workspace: { id: 'workspace-id' } } as any,
      groupByFieldMetadataId: 'group-by-field-id',
      aggregateFieldMetadataId: 'aggregate-field-id',
      aggregateOperation: AggregateOperations.COUNT,
      filter: widgetFilter as any,
      dashboardFilter: dashboardFilter as any,
      userTimezone: 'UTC',
      firstDayOfTheWeek: CalendarStartDay.MONDAY,
      limit: 10,
      primaryAxisOrderBy: GraphOrderBy.VALUE_ASC,
    });

    expect(widgetFilter).toEqual(widgetFilterBeforeExecution);
  });
});
