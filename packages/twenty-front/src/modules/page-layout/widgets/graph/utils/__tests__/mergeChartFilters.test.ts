import { ViewFilterOperand } from 'twenty-shared/types';

import { mergeChartFilters } from '@/page-layout/widgets/graph/utils/mergeChartFilters';

describe('mergeChartFilters', () => {
  it('returns widget-local filters when there are no dashboard filters', () => {
    const localFilter = {
      recordFilters: [
        {
          id: 'local-filter',
          fieldMetadataId: 'amount-field-id',
          value: '10000',
          displayValue: '10000',
          type: 'NUMBER',
          operand: ViewFilterOperand.GREATER_THAN,
          label: 'Amount',
        },
      ],
      recordFilterGroups: [],
    };

    expect(mergeChartFilters(localFilter, undefined)).toEqual(localFilter);
  });

  it('returns both widget-local and dashboard filters when they target different fields', () => {
    const mergedFilters = mergeChartFilters(
      {
        recordFilters: [
          {
            id: 'local-filter',
            fieldMetadataId: 'amount-field-id',
            value: '10000',
            displayValue: '10000',
            type: 'NUMBER',
            operand: ViewFilterOperand.GREATER_THAN,
            label: 'Amount',
          },
        ],
        recordFilterGroups: [],
      },
      {
        recordFilters: [
          {
            fieldMetadataId: 'stage-field-id',
            operand: ViewFilterOperand.IS,
            value: 'NEGOTIATION',
          },
        ],
      },
    );

    expect(mergedFilters).toEqual({
      recordFilters: [
        expect.objectContaining({
          fieldMetadataId: 'amount-field-id',
          operand: ViewFilterOperand.GREATER_THAN,
        }),
        expect.objectContaining({
          fieldMetadataId: 'stage-field-id',
          operand: ViewFilterOperand.IS,
          value: 'NEGOTIATION',
        }),
      ],
      recordFilterGroups: [],
    });
  });

  it('keeps the dashboard filter when both sources target the same field', () => {
    const mergedFilters = mergeChartFilters(
      {
        recordFilters: [
          {
            id: 'local-filter',
            fieldMetadataId: 'owner-field-id',
            value: 'owner-jane',
            displayValue: 'Jane',
            type: 'ACTOR',
            operand: ViewFilterOperand.IS,
            label: 'Owner',
            subFieldName: 'workspaceMemberId',
          },
        ],
        recordFilterGroups: [],
      },
      {
        recordFilters: [
          {
            fieldMetadataId: 'owner-field-id',
            operand: ViewFilterOperand.IS,
            subFieldName: 'workspaceMemberId',
            value: 'owner-john',
          },
        ],
      },
    );

    expect(mergedFilters).toEqual({
      recordFilters: [
        expect.objectContaining({
          fieldMetadataId: 'owner-field-id',
          value: 'owner-john',
        }),
      ],
      recordFilterGroups: [],
    });
  });
});
