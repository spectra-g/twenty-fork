import {
  FieldMetadataType,
  ViewFilterOperand,
  type PartialFieldMetadataItem,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  type RecordFilter,
} from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type DashboardFilter } from 'src/modules/dashboard/chart-data/types/dashboard-filter.type';

type ConvertDashboardFilterToGqlOperationFilterParams = {
  dashboardFilter: DashboardFilter | undefined;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  userTimezone: string;
};

const DEFAULT_DASHBOARD_FILTER_FIELD_NAMES = {
  owner: 'owner',
  stage: 'stage',
  createdAt: 'createdAt',
} as const;

const formatDashboardDateValue = (value: string | Date): string =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

const isDashboardFilterEmpty = (
  dashboardFilter: DashboardFilter | undefined,
): boolean => {
  if (!isDefined(dashboardFilter)) {
    return true;
  }

  const { ownerUserId, stage, dateRange } = dashboardFilter;

  return (
    !isDefined(ownerUserId) &&
    !isDefined(stage) &&
    !isDefined(dateRange?.from) &&
    !isDefined(dateRange?.to)
  );
};

export const convertDashboardFilterToGqlOperationFilter = ({
  dashboardFilter,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  userTimezone,
}: ConvertDashboardFilterToGqlOperationFilterParams): ObjectRecordFilter => {
  if (isDashboardFilterEmpty(dashboardFilter)) {
    return {};
  }

  const fieldIds = flatObjectMetadata.fieldIds ?? [];
  const fields = fieldIds
    .map((fieldId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
    .filter(isDefined);

  const partialFields: PartialFieldMetadataItem[] = fields.map((field) => ({
    id: field.id,
    name: field.name,
    type: field.type,
    label: field.label,
    options: field.options?.map((option) => ({
      id: option.id ?? '',
      label: option.label,
      value: option.value,
      color: 'color' in option ? option.color : undefined,
      position: option.position,
    })),
  }));

  const ownerField = fields.find(
    (field) =>
      field.name === DEFAULT_DASHBOARD_FILTER_FIELD_NAMES.owner &&
      field.type === FieldMetadataType.RELATION,
  );
  const stageField = fields.find(
    (field) =>
      field.name === DEFAULT_DASHBOARD_FILTER_FIELD_NAMES.stage &&
      field.type === FieldMetadataType.SELECT,
  );
  const createdAtField = fields.find(
    (field) =>
      field.name === DEFAULT_DASHBOARD_FILTER_FIELD_NAMES.createdAt &&
      field.type === FieldMetadataType.DATE,
  );

  const recordFilters: Array<Omit<RecordFilter, 'id'>> = [];

  if (isDefined(dashboardFilter?.ownerUserId) && isDefined(ownerField)) {
    recordFilters.push({
      fieldMetadataId: ownerField.id,
      operand: ViewFilterOperand.IS,
      value: JSON.stringify([dashboardFilter.ownerUserId]),
      type: ownerField.type,
    });
  }

  if (isDefined(dashboardFilter?.stage) && isDefined(stageField)) {
    recordFilters.push({
      fieldMetadataId: stageField.id,
      operand: ViewFilterOperand.IS,
      value: JSON.stringify([dashboardFilter.stage]),
      type: stageField.type,
    });
  }

  if (
    isDefined(dashboardFilter?.dateRange?.from) &&
    isDefined(createdAtField)
  ) {
    recordFilters.push({
      fieldMetadataId: createdAtField.id,
      operand: ViewFilterOperand.IS_AFTER,
      value: formatDashboardDateValue(dashboardFilter.dateRange.from),
      type: createdAtField.type,
    });
  }

  if (isDefined(dashboardFilter?.dateRange?.to) && isDefined(createdAtField)) {
    recordFilters.push({
      fieldMetadataId: createdAtField.id,
      operand: ViewFilterOperand.IS_BEFORE,
      value: formatDashboardDateValue(dashboardFilter.dateRange.to),
      type: createdAtField.type,
    });
  }

  return computeRecordGqlOperationFilter({
    fields: partialFields,
    recordFilters,
    recordFilterGroups: [],
    filterValueDependencies: {
      timeZone: userTimezone,
    },
  });
};
