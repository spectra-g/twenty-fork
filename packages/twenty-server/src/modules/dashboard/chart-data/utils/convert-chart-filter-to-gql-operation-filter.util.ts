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

type ConvertChartFilterToGqlOperationFilterParams = {
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

export const convertChartFilterToGqlOperationFilter = ({
  filter,
  dashboardFilters,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  userTimezone,
}: ConvertChartFilterToGqlOperationFilterParams): ObjectRecordFilter => {
  const fieldIds = flatObjectMetadata.fieldIds ?? [];

  const widgetRecordFilters = filter?.recordFilters ?? [];
  const applicableDashboardRecordFilters = (dashboardFilters ?? [])
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
    });

  const recordFilters = [
    ...widgetRecordFilters,
    ...applicableDashboardRecordFilters,
  ];
  const recordFilterGroups = filter?.recordFilterGroups ?? [];

  if (recordFilters.length === 0 && recordFilterGroups.length === 0) {
    return {};
  }

  const fields: PartialFieldMetadataItem[] = fieldIds
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

  return computeRecordGqlOperationFilter({
    fields,
    recordFilters: convertedRecordFilters,
    recordFilterGroups: convertedRecordFilterGroups,
    filterValueDependencies: {
      timeZone: userTimezone,
    },
  });
};
