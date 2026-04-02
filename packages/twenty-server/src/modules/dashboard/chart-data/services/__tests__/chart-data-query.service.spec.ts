/* eslint-disable @nx/enforce-module-boundaries */
import { Test, type TestingModule } from '@nestjs/testing';

import { CalendarStartDay } from 'twenty-shared/constants';
import {
  AggregateOperations,
  FieldMetadataType,
  ViewFilterOperand,
  type ChartFilter,
} from 'twenty-shared/types';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';

describe('ChartDataQueryService', () => {
  let service: ChartDataQueryService;
  let executeMock: jest.Mock;
  let isFeatureEnabledMock: jest.Mock;

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
        type: FieldMetadataType.SELECT,
        options: [
          {
            id: 'status-option-open-id',
            value: 'OPEN',
            label: 'Open',
            position: 0,
            color: 'green',
          },
        ],
        universalIdentifier: 'status-field-universal-id',
      },
      'source-field-universal-id': {
        id: 'source-field-id',
        name: 'source',
        label: 'Source',
        type: FieldMetadataType.SELECT,
        options: [
          {
            id: 'source-option-website-id',
            value: 'WEBSITE',
            label: 'Website',
            position: 0,
            color: 'blue',
          },
        ],
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
        value: JSON.stringify(['OPEN']),
      },
    ],
  };

  const globalFilter: ChartFilter = {
    recordFilters: [
      {
        fieldMetadataId: 'source-field-id',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(['WEBSITE']),
      },
    ],
  };

  const localFilterWithUnavailableOption: ChartFilter = {
    recordFilters: [
      {
        fieldMetadataId: 'status-field-id',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(['PRIVATE']),
      },
      {
        fieldMetadataId: 'status-field-id',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(['OPEN']),
      },
    ],
  };

  const globalFilterWithUnavailableOption: ChartFilter = {
    recordFilters: [
      {
        fieldMetadataId: 'source-field-id',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(['PARTNER']),
      },
    ],
  };

  beforeEach(async () => {
    executeMock = jest.fn().mockResolvedValue([]);
    isFeatureEnabledMock = jest.fn().mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartDataQueryService,
        {
          provide: CommonGroupByQueryRunnerService,
          useValue: {
            execute: executeMock,
          },
        },
        {
          provide: FeatureFlagService,
          useValue: {
            isFeatureEnabled: isFeatureEnabledMock,
          },
        },
      ],
    }).compile();

    service = module.get(ChartDataQueryService);
  });

  it('ignores global filters when IS_DASHBOARD_V2_ENABLED is disabled', async () => {
    isFeatureEnabledMock.mockResolvedValue(false);

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

    expect(isFeatureEnabledMock).toHaveBeenCalledWith(
      FeatureFlagKey.IS_DASHBOARD_V2_ENABLED,
      'workspace-id',
    );
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {
          status: {
            in: ['OPEN'],
          },
        },
      }),
      expect.any(Object),
    );
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
                in: ['WEBSITE'],
              },
            },
            {
              status: {
                in: ['OPEN'],
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
            in: ['OPEN'],
          },
        },
      }),
      expect.any(Object),
    );
  });

  it('drops unavailable select option values before executing chart data queries', async () => {
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
      filter: localFilterWithUnavailableOption,
      globalFilter: globalFilterWithUnavailableOption,
      userTimezone: 'UTC',
      firstDayOfTheWeek: CalendarStartDay.MONDAY,
      limit: 10,
    });

    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {
          status: {
            in: ['OPEN'],
          },
        },
      }),
      expect.any(Object),
    );
  });
});
