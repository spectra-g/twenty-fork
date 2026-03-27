/* eslint-disable @nx/enforce-module-boundaries */
import {
  type ChartFilter,
  type CompositeFieldSubFieldName,
  type FilterableAndTSVectorFieldType,
  type PartialFieldMetadataItem,
  type RecordFilterGroupLogicalOperator,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  isDefined,
  type RecordFilter,
  type RecordFilterGroup,
} from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type DashboardFilterVariable } from 'src/modules/dashboard/chart-data/types/dashboard-filter-variable.type';

type MergeChartFiltersWithDashboardFiltersParams = {
  filter: ChartFilter | undefined;
  dashboardFilters?: DashboardFilterVariable[];
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  userTimezone: string;
};

const stringifyDashboardFilterValue = (
  value: DashboardFilterVariable['value'],
): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (!isDefined(value)) {
    return '';
  }

  return JSON.stringify(value);
};

const buildFieldsMetadata = ({
  fieldIds,
  flatFieldMetadataMaps,
}: {
  fieldIds: string[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): PartialFieldMetadataItem[] =>
  fieldIds
    .map((fieldId: string) => {
      const field = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(field)) {
        return null;
      }

      return {
        id: field.id,
        name: field.name,
        type: field.type,
        label: field.label,
        options: field.options?.map((opt) => ({
          id: opt.id ?? '',
          label: opt.label,
          value: opt.value,
          color: 'color' in opt ? opt.color : undefined,
          position: opt.position,
        })),
      };
    })
    .filter(isDefined);

const buildOperationFilter = ({
  fields,
  recordFilters,
  recordFilterGroups,
  flatFieldMetadataMaps,
  userTimezone,
}: {
  fields: PartialFieldMetadataItem[];
  recordFilters: Array<{
    fieldMetadataId: string;
    value?: string | null;
    type?: FilterableAndTSVectorFieldType | '';
    recordFilterGroupId?: string | null;
    operand: string;
    subFieldName?: string | null;
  }>;
  recordFilterGroups: Array<{
    id: string;
    parentRecordFilterGroupId?: string | null;
    logicalOperator: string;
  }>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  userTimezone: string;
}): ObjectRecordFilter => {
  if (recordFilters.length === 0 && recordFilterGroups.length === 0) {
    return {};
  }

  const convertedRecordFilters: Omit<RecordFilter, 'id'>[] = recordFilters.map(
    (recordFilter) => {
      const field = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: recordFilter.fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      return {
        fieldMetadataId: recordFilter.fieldMetadataId,
        value: recordFilter.value ?? '',
        type: (field?.type ??
          recordFilter.type ??
          '') as FilterableAndTSVectorFieldType,
        recordFilterGroupId: recordFilter.recordFilterGroupId ?? undefined,
        operand: recordFilter.operand as ViewFilterOperand,
        subFieldName: (recordFilter.subFieldName ?? undefined) as
          | CompositeFieldSubFieldName
          | undefined,
      };
    },
  );

  const convertedRecordFilterGroups: RecordFilterGroup[] =
    recordFilterGroups.map((recordFilterGroup) => ({
      id: recordFilterGroup.id,
      parentRecordFilterGroupId:
        recordFilterGroup.parentRecordFilterGroupId ?? undefined,
      logicalOperator:
        recordFilterGroup.logicalOperator as RecordFilterGroupLogicalOperator,
    }));

  const operationFilter = computeRecordGqlOperationFilter({
    fields,
    recordFilters: convertedRecordFilters,
    recordFilterGroups: convertedRecordFilterGroups,
    filterValueDependencies: {
      timeZone: userTimezone,
    },
  });

  return normalizeEmptyOperationFilter(operationFilter);
};

const normalizeEmptyOperationFilter = (
  operationFilter: ObjectRecordFilter,
): ObjectRecordFilter => {
  if (!operationFilter || Object.keys(operationFilter).length === 0) {
    return {};
  }

  if ('and' in operationFilter && Array.isArray(operationFilter.and)) {
    const normalizedFilters = operationFilter.and
      .map((nestedFilter) =>
        normalizeEmptyOperationFilter(nestedFilter as ObjectRecordFilter),
      )
      .filter((nestedFilter) => Object.keys(nestedFilter).length > 0);

    return normalizedFilters.length === 0
      ? {}
      : normalizedFilters.length === 1
        ? normalizedFilters[0]
        : { and: normalizedFilters };
  }

  if ('or' in operationFilter && Array.isArray(operationFilter.or)) {
    const normalizedFilters = operationFilter.or
      .map((nestedFilter) =>
        normalizeEmptyOperationFilter(nestedFilter as ObjectRecordFilter),
      )
      .filter((nestedFilter) => Object.keys(nestedFilter).length > 0);

    return normalizedFilters.length === 0
      ? {}
      : normalizedFilters.length === 1
        ? normalizedFilters[0]
        : { or: normalizedFilters };
  }

  return operationFilter;
};

export const mergeChartFiltersWithDashboardFilters = ({
  filter,
  dashboardFilters,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  userTimezone,
}: MergeChartFiltersWithDashboardFiltersParams): ObjectRecordFilter => {
  const fieldIds = flatObjectMetadata.fieldIds ?? [];
  const fields = buildFieldsMetadata({
    fieldIds,
    flatFieldMetadataMaps,
  });

  const widgetOperationFilter = buildOperationFilter({
    fields,
    recordFilters: filter?.recordFilters ?? [],
    recordFilterGroups: filter?.recordFilterGroups ?? [],
    flatFieldMetadataMaps,
    userTimezone,
  });

  const dashboardOperationFilter = buildOperationFilter({
    fields,
    recordFilters: (dashboardFilters ?? [])
      .filter((dashboardFilter) =>
        fieldIds.includes(dashboardFilter.fieldMetadataId),
      )
      .map((dashboardFilter) => {
        const field = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: dashboardFilter.fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        return {
          fieldMetadataId: dashboardFilter.fieldMetadataId,
          operand: dashboardFilter.operand,
          value: stringifyDashboardFilterValue(dashboardFilter.value),
          type: field?.type,
        };
      }),
    recordFilterGroups: [],
    flatFieldMetadataMaps,
    userTimezone,
  });

  return combineFilters([widgetOperationFilter, dashboardOperationFilter]);
};
