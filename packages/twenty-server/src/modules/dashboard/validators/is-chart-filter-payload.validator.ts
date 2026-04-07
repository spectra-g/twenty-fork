import {
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

import {
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
  type ChartFilter,
  type ChartRecordFilter,
  type ChartRecordFilterGroup,
  ViewFilterOperand,
} from 'twenty-shared/types';

const validateRecordFilter = (recordFilter: unknown): recordFilter is ChartRecordFilter => {
  if (typeof recordFilter !== 'object' || recordFilter === null) {
    return false;
  }

  const candidate = recordFilter as Record<string, unknown>;

  const hasValidFieldMetadataId = typeof candidate.fieldMetadataId === 'string';
  const hasValidOperand =
    typeof candidate.operand === 'string' &&
    Object.values(ViewFilterOperand).includes(candidate.operand as ViewFilterOperand);
  const hasValidType =
    candidate.type === undefined ||
    (typeof candidate.type === 'string' &&
      Object.values(FieldMetadataType).includes(candidate.type as FieldMetadataType));
  const hasValidValue =
    candidate.value === undefined ||
    candidate.value === null ||
    typeof candidate.value === 'string';
  const hasValidRecordFilterGroupId =
    candidate.recordFilterGroupId === undefined ||
    candidate.recordFilterGroupId === null ||
    typeof candidate.recordFilterGroupId === 'string';
  const hasValidSubFieldName =
    candidate.subFieldName === undefined ||
    candidate.subFieldName === null ||
    typeof candidate.subFieldName === 'string';

  return (
    hasValidFieldMetadataId &&
    hasValidOperand &&
    hasValidType &&
    hasValidValue &&
    hasValidRecordFilterGroupId &&
    hasValidSubFieldName
  );
};

const validateRecordFilterGroup = (
  recordFilterGroup: unknown,
): recordFilterGroup is ChartRecordFilterGroup => {
  if (typeof recordFilterGroup !== 'object' || recordFilterGroup === null) {
    return false;
  }

  const candidate = recordFilterGroup as Record<string, unknown>;

  const hasValidId = typeof candidate.id === 'string';
  const hasValidLogicalOperator =
    typeof candidate.logicalOperator === 'string' &&
    Object.values(RecordFilterGroupLogicalOperator).includes(
      candidate.logicalOperator as RecordFilterGroupLogicalOperator,
    );
  const hasValidParentRecordFilterGroupId =
    candidate.parentRecordFilterGroupId === undefined ||
    candidate.parentRecordFilterGroupId === null ||
    typeof candidate.parentRecordFilterGroupId === 'string';

  return (
    hasValidId &&
    hasValidLogicalOperator &&
    hasValidParentRecordFilterGroupId
  );
};

@ValidatorConstraint({ name: 'is-chart-filter-payload', async: false })
export class IsChartFilterPayloadValidator
  implements ValidatorConstraintInterface
{
  validate(value: unknown) {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const filter = value as ChartFilter;
    const recordFilters = filter.recordFilters ?? [];
    const recordFilterGroups = filter.recordFilterGroups ?? [];

    if (!Array.isArray(recordFilters) || !Array.isArray(recordFilterGroups)) {
      return false;
    }

    return (
      recordFilters.every(validateRecordFilter) &&
      recordFilterGroups.every(validateRecordFilterGroup)
    );
  }

  defaultMessage() {
    return 'filter must be a valid chart filter payload';
  }
}
