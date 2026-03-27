/* eslint-disable @nx/enforce-module-boundaries */
import { ViewFilterOperand, FieldMetadataType } from 'twenty-shared/types';

import { mergeChartFiltersWithDashboardFilters } from 'src/modules/dashboard/chart-data/utils/merge-chart-filters-with-dashboard-filters.util';

const stageFieldId = 'stage-field-id';
const foreignFieldId = 'foreign-field-id';

const flatObjectMetadata = {
  id: 'opportunity-object-id',
  fieldIds: [stageFieldId],
} as any;

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    stage: {
      id: stageFieldId,
      name: 'stage',
      label: 'Stage',
      type: FieldMetadataType.SELECT,
      universalIdentifier: 'stage',
      options: [
        { value: 'NEW', label: 'New', position: 0 },
        { value: 'SCREENING', label: 'Screening', position: 1 },
      ],
    },
    foreign: {
      id: foreignFieldId,
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.TEXT,
      universalIdentifier: 'foreign',
    },
  },
  universalIdentifierById: {
    [stageFieldId]: 'stage',
    [foreignFieldId]: 'foreign',
  },
  universalIdentifiersByApplicationId: {},
} as any;

describe('mergeChartFiltersWithDashboardFilters', () => {
  it('should return the widget filter when no dashboard filters apply', () => {
    const result = mergeChartFiltersWithDashboardFilters({
      filter: {
        recordFilters: [
          {
            fieldMetadataId: stageFieldId,
            operand: ViewFilterOperand.IS,
            value: '["SCREENING"]',
          },
        ],
        recordFilterGroups: [],
      },
      dashboardFilters: [],
      flatObjectMetadata,
      flatFieldMetadataMaps,
      userTimezone: 'UTC',
    });

    expect(result).toEqual({
      stage: { in: ['SCREENING'] },
    });
  });

  it('should ignore empty widget filter groups when combining dashboard filters', () => {
    const result = mergeChartFiltersWithDashboardFilters({
      filter: {
        recordFilters: [],
        recordFilterGroups: [
          {
            id: 'empty-root-group',
            logicalOperator: 'AND',
          },
        ],
      },
      dashboardFilters: [
        {
          fieldMetadataId: stageFieldId,
          operand: ViewFilterOperand.IS,
          value: '["NEW"]',
        },
      ],
      flatObjectMetadata,
      flatFieldMetadataMaps,
      userTimezone: 'UTC',
    });

    expect(result).toEqual({
      stage: { in: ['NEW'] },
    });
  });
});
