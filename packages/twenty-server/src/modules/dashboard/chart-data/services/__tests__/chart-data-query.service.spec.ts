import { Test, type TestingModule } from '@nestjs/testing';

import { CalendarStartDay } from 'twenty-shared/constants';
import {
  AggregateOperations,
  FieldMetadataType,
  ViewFilterOperand,
  type ChartFilter,
} from 'twenty-shared/types';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';

describe('ChartDataQueryService', () => {
  let service: ChartDataQueryService;
  let executeMock: jest.Mock;

  const flatObjectMetadata = {
    id: 'company-object-id',
    nameSingular: 'company',
    fieldIds: ['status-field-id', 'source-field-id', 'count-field-id'],
  } as any;

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: {
      'status-field-universal-id': {
        id: 'status-field-id',
        name: 'status',
        label: 'Status',
        type: FieldMetadataType.UUID,
        universalIdentifier: 'status-field-universal-id',
      },
      'source-field-universal-id': {
        id: 'source-field-id',
        name: 'source',
        label: 'Source',
        type: FieldMetadataType.UUID,
        universalIdentifier: 'source-field-universal-id',
      },
      'count-field-universal-id': {
        id: 'count-field-id',
        name: 'employees',
        label: 'Employees',
        type: FieldMetadataType.NUMBER,
        universalIdentifier: 'count-field-universal-id',
      },
    },
    universalIdentifierById: {
      'status-field-id': 'status-field-universal-id',
      'source-field-id': 'source-field-universal-id',
      'count-field-id': 'count-field-universal-id',
    },
    universalIdentifiersByApplicationId: {},
  } as any;

  const flatObjectMetadataMaps = {
    byUniversalIdentifier: {
      'company-object-universal-id': {
        ...flatObjectMetadata,
        universalIdentifier: 'company-object-universal-id',
      },
    },
    universalIdentifierById: {
      [flatObjectMetadata.id]: 'company-object-universal-id',
    },
    universalIdentifiersByApplicationId: {},
  } as any;

  const localFilter: ChartFilter = {
    recordFilters: [
      {
        fieldMetadataId: 'status-field-id',
        operand: ViewFilterOperand.IS,
        value: '11111111-1111-4111-8111-111111111111',
      },
    ],
  };

  const globalFilter: ChartFilter = {
    recordFilters: [
      {
        fieldMetadataId: 'source-field-id',
        operand: ViewFilterOperand.IS,
        value: '22222222-2222-4222-8222-222222222222',
      },
    ],
  };

  beforeEach(async () => {
    executeMock = jest.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartDataQueryService,
        {
          provide: CommonGroupByQueryRunnerService,
          useValue: {
            execute: executeMock,
          },
        },
      ],
    }).compile();

    service = module.get(ChartDataQueryService);
  });

  it('combines global and local chart filters with top-level AND logic', async () => {
    await service.executeGroupByQuery({
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      objectIdByNameSingular: {
        company: flatObjectMetadata.id,
      },
      authContext: {
        workspace: { id: 'workspace-id' } as any,
      } as any,
      groupByFieldMetadataId: 'status-field-id',
      aggregateFieldMetadataId: 'count-field-id',
      aggregateOperation: AggregateOperations.COUNT,
      filter: localFilter,
      globalFilter,
      userTimezone: 'UTC',
      firstDayOfTheWeek: CalendarStartDay.MONDAY,
      limit: 10,
    });

    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {
          and: [
            {
              source: {
                in: ['22222222-2222-4222-8222-222222222222'],
              },
            },
            {
              status: {
                in: ['11111111-1111-4111-8111-111111111111'],
              },
            },
          ],
        },
      }),
      expect.any(Object),
    );
  });

  it('preserves existing local-only filtering behavior when no global filter exists', async () => {
    await service.executeGroupByQuery({
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      objectIdByNameSingular: {
        company: flatObjectMetadata.id,
      },
      authContext: {
        workspace: { id: 'workspace-id' } as any,
      } as any,
      groupByFieldMetadataId: 'status-field-id',
      aggregateFieldMetadataId: 'count-field-id',
      aggregateOperation: AggregateOperations.COUNT,
      filter: localFilter,
      userTimezone: 'UTC',
      firstDayOfTheWeek: CalendarStartDay.MONDAY,
      limit: 10,
    });

    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {
          status: {
            in: ['11111111-1111-4111-8111-111111111111'],
          },
        },
      }),
      expect.any(Object),
    );
  });
});
