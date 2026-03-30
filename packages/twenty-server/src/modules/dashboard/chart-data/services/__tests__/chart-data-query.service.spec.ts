import { Test, type TestingModule } from '@nestjs/testing';

import { CalendarStartDay } from 'twenty-shared/constants';
import {
  AggregateOperations,
  FieldMetadataType,
  type ChartFilter,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';

describe('ChartDataQueryService', () => {
  let service: ChartDataQueryService;
  let mockExecute: jest.Mock;
  const ownerUserId = '550e8400-e29b-41d4-a716-446655440000';

  const mockAuthContext: AuthContext = {
    user: {
      id: ownerUserId,
    } as AuthContext['user'],
  };

  const stageField = {
    id: 'stage-field-id',
    name: 'stage',
    label: 'Stage',
    type: FieldMetadataType.SELECT,
    options: [
      {
        id: 'won-option-id',
        value: 'WON',
        label: 'Won',
        color: 'green',
        position: 0,
      },
    ],
  };

  const ownerField = {
    id: 'owner-field-id',
    name: 'owner',
    label: 'Owner',
    type: FieldMetadataType.RELATION,
  };

  const groupByField = {
    id: 'group-by-field-id',
    name: 'status',
    label: 'Status',
    type: FieldMetadataType.TEXT,
  };

  const aggregateField = {
    id: 'aggregate-field-id',
    name: 'amount',
    label: 'Amount',
    type: FieldMetadataType.NUMBER,
  };

  const flatObjectMetadata = {
    id: 'company-id',
    nameSingular: 'company',
    namePlural: 'companies',
    fieldIds: [
      stageField.id,
      ownerField.id,
      groupByField.id,
      aggregateField.id,
    ],
  };

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: {
      'stage-field-universal-id': {
        ...stageField,
        universalIdentifier: 'stage-field-universal-id',
      },
      'owner-field-universal-id': {
        ...ownerField,
        universalIdentifier: 'owner-field-universal-id',
      },
      'group-by-field-universal-id': {
        ...groupByField,
        universalIdentifier: 'group-by-field-universal-id',
      },
      'aggregate-field-universal-id': {
        ...aggregateField,
        universalIdentifier: 'aggregate-field-universal-id',
      },
    },
    universalIdentifierById: {
      [stageField.id]: 'stage-field-universal-id',
      [ownerField.id]: 'owner-field-universal-id',
      [groupByField.id]: 'group-by-field-universal-id',
      [aggregateField.id]: 'aggregate-field-universal-id',
    },
    universalIdentifiersByApplicationId: {},
  };

  const baseParams = {
    flatObjectMetadata: flatObjectMetadata as never,
    flatFieldMetadataMaps: flatFieldMetadataMaps as never,
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        'company-universal-id': {
          ...flatObjectMetadata,
          universalIdentifier: 'company-universal-id',
        },
      },
      universalIdentifierById: {
        [flatObjectMetadata.id]: 'company-universal-id',
      },
      universalIdentifiersByApplicationId: {},
    } as never,
    objectIdByNameSingular: {
      company: flatObjectMetadata.id,
    },
    authContext: mockAuthContext,
    groupByFieldMetadataId: groupByField.id,
    aggregateFieldMetadataId: aggregateField.id,
    aggregateOperation: AggregateOperations.COUNT,
    userTimezone: 'UTC',
    firstDayOfTheWeek: CalendarStartDay.MONDAY,
    limit: 10,
  };

  beforeEach(async () => {
    mockExecute = jest.fn().mockResolvedValue([]);

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

  it('should merge dashboard and widget filters with logical AND (AC-001)', async () => {
    const widgetFilter: ChartFilter = {
      recordFilters: [
        {
          fieldMetadataId: stageField.id,
          operand: ViewFilterOperand.IS,
          value: '["WON"]',
        },
      ],
      recordFilterGroups: [],
    };

    await service.executeGroupByQuery({
      ...baseParams,
      filter: widgetFilter,
      dashboardFilter: {
        ownerUserId,
      },
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {
          and: expect.arrayContaining([
            { stage: { in: ['WON'] } },
            { ownerId: { in: [ownerUserId] } },
          ]),
        },
      }),
      expect.anything(),
    );
  });

  it('should apply only widget filters when no dashboard filters provided (AC-002)', async () => {
    const widgetFilter: ChartFilter = {
      recordFilters: [
        {
          fieldMetadataId: stageField.id,
          operand: ViewFilterOperand.IS,
          value: '["WON"]',
        },
      ],
      recordFilterGroups: [],
    };

    await service.executeGroupByQuery({
      ...baseParams,
      filter: widgetFilter,
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { stage: { in: ['WON'] } },
      }),
      expect.anything(),
    );
  });

  it('should ignore empty dashboard filters and apply only widget filters (AC-003)', async () => {
    const widgetFilter: ChartFilter = {
      recordFilters: [
        {
          fieldMetadataId: stageField.id,
          operand: ViewFilterOperand.IS,
          value: '["WON"]',
        },
      ],
      recordFilterGroups: [],
    };

    await service.executeGroupByQuery({
      ...baseParams,
      filter: widgetFilter,
      dashboardFilter: {
        ownerUserId: undefined,
        stage: undefined,
        dateRange: {
          from: undefined,
          to: undefined,
        },
      },
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { stage: { in: ['WON'] } },
      }),
      expect.anything(),
    );
  });
});
