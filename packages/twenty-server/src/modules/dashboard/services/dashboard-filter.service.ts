import { Injectable } from '@nestjs/common';

import {
  type FilterObjectDTO,
  type FilterValueDTO,
} from 'src/modules/dashboard/dtos/filter.dto';

@Injectable()
export class DashboardFilterService {
  composeFilters(
    globalFilters: FilterObjectDTO,
    localFilters: FilterObjectDTO,
  ): FilterObjectDTO {
    return this.mergeFilterObjects(globalFilters, localFilters);
  }

  applyPermissionStripping(
    filters: FilterObjectDTO,
    allowedFields: string[],
  ): FilterObjectDTO {
    if (allowedFields.length === 0) {
      return {};
    }

    const allowedFieldSet = new Set(allowedFields);

    return this.stripDisallowedFields(filters, allowedFieldSet, []);
  }

  private mergeFilterObjects(
    globalObject: FilterObjectDTO,
    localObject: FilterObjectDTO,
  ): FilterObjectDTO {
    const mergedResult: FilterObjectDTO = { ...globalObject };

    for (const [key, localValue] of Object.entries(localObject)) {
      const globalValue = mergedResult[key];

      if (
        this.isFilterObject(globalValue) &&
        this.isFilterObject(localValue) &&
        !Array.isArray(globalValue) &&
        !Array.isArray(localValue)
      ) {
        mergedResult[key] = this.mergeFilterObjects(globalValue, localValue);
        continue;
      }

      mergedResult[key] = localValue;
    }

    return mergedResult;
  }

  private stripDisallowedFields(
    sourceObject: FilterObjectDTO,
    allowedFields: Set<string>,
    currentPath: string[],
  ): FilterObjectDTO {
    const strippedObject: FilterObjectDTO = {};

    for (const [key, value] of Object.entries(sourceObject)) {
      const nextPath = [...currentPath, key];

      if (this.isFilterObject(value) && !Array.isArray(value)) {
        const nestedResult = this.stripDisallowedFields(
          value,
          allowedFields,
          nextPath,
        );

        if (Object.keys(nestedResult).length > 0) {
          strippedObject[key] = nestedResult;
        }

        continue;
      }

      if (Array.isArray(value)) {
        const filteredArray = value.filter((item) =>
          this.isValueAllowed(item, allowedFields, nextPath),
        );

        if (filteredArray.length > 0) {
          strippedObject[key] = filteredArray;
        }

        continue;
      }

      if (allowedFields.has(nextPath.join('.'))) {
        strippedObject[key] = value;
      }
    }

    return strippedObject;
  }

  private isValueAllowed(
    value: FilterValueDTO,
    allowedFields: Set<string>,
    currentPath: string[],
  ): boolean {
    if (this.isFilterObject(value) && !Array.isArray(value)) {
      return (
        Object.keys(
          this.stripDisallowedFields(value, allowedFields, currentPath),
        ).length > 0
      );
    }

    return allowedFields.has(currentPath.join('.'));
  }

  private isFilterObject(value: unknown): value is FilterObjectDTO {
    return typeof value === 'object' && value !== null;
  }
}
