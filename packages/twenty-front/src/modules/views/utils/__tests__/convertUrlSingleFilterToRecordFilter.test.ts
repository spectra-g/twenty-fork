/* eslint-disable @nx/enforce-module-boundaries */
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { convertUrlSingleFilterToRecordFilter } from '@/views/utils/convertUrlSingleFilterToRecordFilter';

const objectMetadataItem = {
  fields: [
    {
      id: 'status-field-id',
      name: 'status',
      label: 'Status',
      type: FieldMetadataType.SELECT,
      options: [
        {
          id: 'status-option-open-id',
          label: 'Open',
          value: 'OPEN',
          position: 0,
          color: 'green',
        },
      ],
    },
    {
      id: 'name-field-id',
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.TEXT,
    },
  ],
} as ObjectMetadataItem;

describe('convertUrlSingleFilterToRecordFilter', () => {
  it('returns null when a select URL filter value is unavailable in field options', () => {
    const recordFilter = convertUrlSingleFilterToRecordFilter({
      urlSingleFilter: {
        field: 'status',
        op: ViewFilterOperand.IS,
        value: 'PRIVATE',
      },
      objectMetadataItem,
      positionInGroup: 0,
    });

    expect(recordFilter).toBeNull();
  });

  it('returns a record filter when a select URL filter value is available in field options', () => {
    const recordFilter = convertUrlSingleFilterToRecordFilter({
      urlSingleFilter: {
        field: 'status',
        op: ViewFilterOperand.IS,
        value: 'OPEN',
      },
      objectMetadataItem,
      positionInGroup: 0,
    });

    expect(recordFilter).toEqual(
      expect.objectContaining({
        fieldMetadataId: 'status-field-id',
        value: 'OPEN',
        operand: ViewFilterOperand.IS,
      }),
    );
  });

  it('keeps non-select URL filters unchanged', () => {
    const recordFilter = convertUrlSingleFilterToRecordFilter({
      urlSingleFilter: {
        field: 'name',
        op: ViewFilterOperand.CONTAINS,
        value: 'Acme',
      },
      objectMetadataItem,
      positionInGroup: 0,
    });

    expect(recordFilter).toEqual(
      expect.objectContaining({
        fieldMetadataId: 'name-field-id',
        value: 'Acme',
        operand: ViewFilterOperand.CONTAINS,
      }),
    );
  });

  it('returns null when a URL filter references an unknown field', () => {
    const recordFilter = convertUrlSingleFilterToRecordFilter({
      urlSingleFilter: {
        field: 'unknownField',
        op: ViewFilterOperand.IS,
        value: 'OPEN',
      },
      objectMetadataItem,
      positionInGroup: 0,
    });

    expect(recordFilter).toBeNull();
  });

  it('returns null when a URL filter has a malformed sub-field for a non-composite field', () => {
    const recordFilter = convertUrlSingleFilterToRecordFilter({
      urlSingleFilter: {
        field: 'status',
        subField: 'badSubField',
        op: ViewFilterOperand.IS,
        value: 'OPEN',
      },
      objectMetadataItem,
      positionInGroup: 0,
    });

    expect(recordFilter).toBeNull();
  });
});
