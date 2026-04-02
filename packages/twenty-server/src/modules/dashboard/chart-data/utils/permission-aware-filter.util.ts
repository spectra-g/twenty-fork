/* eslint-disable @nx/enforce-module-boundaries */
import { type ChartFilter } from 'twenty-shared/types';
import { isDefined, isFieldMetadataSelectKind } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const normalizeSelectFilterValue = ({
  value,
  allowedValues,
}: {
  value?: string | null;
  allowedValues: string[];
}): string | null => {
  if (!isDefined(value)) {
    return null;
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(value);
  } catch {
    return null;
  }

  const selectedValues = Array.isArray(parsedValue)
    ? parsedValue
    : [parsedValue];
  const normalizedValues = selectedValues.filter(
    (selectedValue): selectedValue is string =>
      typeof selectedValue === 'string' &&
      allowedValues.includes(selectedValue),
  );

  if (normalizedValues.length === 0) {
    return null;
  }

  return JSON.stringify(normalizedValues);
};

export const normalizeChartFilterForPermissions = ({
  filter,
  flatFieldMetadataMaps,
}: {
  filter?: ChartFilter;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): ChartFilter | undefined => {
  if (!isDefined(filter)) {
    return undefined;
  }

  return {
    ...filter,
    recordFilters: (filter.recordFilters ?? []).flatMap((recordFilter) => {
      const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: recordFilter.fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(fieldMetadata)) {
        return [];
      }

      if (!isFieldMetadataSelectKind(fieldMetadata.type)) {
        return [recordFilter];
      }

      const allowedValues =
        fieldMetadata.options?.map((option) => option.value) ?? [];

      if (allowedValues.length === 0) {
        return [recordFilter];
      }

      const normalizedValue = normalizeSelectFilterValue({
        value: recordFilter.value,
        allowedValues,
      });

      if (!isDefined(normalizedValue)) {
        return [];
      }

      return [{ ...recordFilter, value: normalizedValue }];
    }),
  };
};
