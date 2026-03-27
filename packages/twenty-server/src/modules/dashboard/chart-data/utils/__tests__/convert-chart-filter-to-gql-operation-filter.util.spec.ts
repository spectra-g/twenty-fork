/* eslint-disable @nx/enforce-module-boundaries */
import { ViewFilterOperand, FieldMetadataType } from 'twenty-shared/types';

import { convertChartFilterToGqlOperationFilter } from 'src/modules/dashboard/chart-data/utils/convert-chart-filter-to-gql-operation-filter.util';

const stageFieldId = 'stage-field-id';
const amountFieldId = 'amount-field-id';
const foreignFieldId = 'foreign-field-id';

const flatObjectMetadata = {
  id: 'opportunity-object-id',
  fieldIds: [stageFieldId, amountFieldId],
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
    amount: {
      id: amountFieldId,
      name: 'amount',
      label: 'Amount',
      type: FieldMetadataType.CURRENCY,
      universalIdentifier: 'amount',
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
    [amountFieldId]: 'amount',
    [foreignFieldId]: 'foreign',
  },
  universalIdentifiersByApplicationId: {},
} as any;

describe('convertChartFilterToGqlOperationFilter', () => {
  it('should combine widget and dashboard filters with AND semantics', () => {
    const result = convertChartFilterToGqlOperationFilter({
      filter: {
        recordFilters: [
          {
            fieldMetadataId: stageFieldId,
            operand: ViewFilterOperand.IS,
            value: '["SCREENING"]',
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
      and: [{ stage: { in: ['SCREENING'] } }, { stage: { in: ['NEW'] } }],
    });
  });

  it('should skip dashboard filters for fields outside the widget object metadata', () => {
    const result = convertChartFilterToGqlOperationFilter({
      filter: {
        recordFilters: [
          {
            fieldMetadataId: stageFieldId,
            operand: ViewFilterOperand.IS,
            value: '["NEW"]',
          },
        ],
      },
      dashboardFilters: [
        {
          fieldMetadataId: foreignFieldId,
          operand: ViewFilterOperand.CONTAINS,
          value: 'Acme',
        },
        {
          fieldMetadataId: stageFieldId,
          operand: ViewFilterOperand.IS,
          value: '["SCREENING"]',
        },
      ],
      flatObjectMetadata,
      flatFieldMetadataMaps,
      userTimezone: 'UTC',
    });

    expect(result).toEqual({
      and: [{ stage: { in: ['NEW'] } }, { stage: { in: ['SCREENING'] } }],
    });
  });
});
