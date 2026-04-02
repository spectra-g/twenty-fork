import { isObject } from '@sniptt/guards';
import qs from 'qs';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { filterUrlQueryParamsSchema } from '@/views/schemas/filterUrlQueryParamsSchema';
import { convertUrlSingleFilterToRecordFilter } from '@/views/utils/convertUrlSingleFilterToRecordFilter';
import { deserializeUrlRecursiveFilterGroup } from '@/views/utils/deserializeUrlRecursiveFilterGroup';
import { splitFieldNameIntoBaseAndSubField } from '@/views/utils/splitFieldNameIntoBaseAndSubField';
import { isDefined } from 'twenty-shared/utils';

export const getDashboardFiltersFromSearchParams = ({
  searchParams,
  objectMetadataItem,
}: {
  searchParams: URLSearchParams;
  objectMetadataItem: ObjectMetadataItem;
}): {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
} => {
  const queryParamsValidation = filterUrlQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  if (!queryParamsValidation.success) {
    return { recordFilters: [], recordFilterGroups: [] };
  }

  const simpleRecordFilters: RecordFilter[] = [];
  const filterQueryParams = queryParamsValidation.data.filter;

  if (isDefined(filterQueryParams)) {
    for (const [fieldName, filterFromURL] of Object.entries(
      filterQueryParams,
    )) {
      const { baseFieldName, subFieldName } =
        splitFieldNameIntoBaseAndSubField(fieldName);

      for (const [filterOperandFromURL, filterValueFromURL] of Object.entries(
        filterFromURL,
      )) {
        const filterValueAsString =
          Array.isArray(filterValueFromURL) || isObject(filterValueFromURL)
            ? JSON.stringify(filterValueFromURL)
            : filterValueFromURL;

        const recordFilter = convertUrlSingleFilterToRecordFilter({
          urlSingleFilter: {
            field: baseFieldName,
            op: filterOperandFromURL,
            value: filterValueAsString,
            ...(isDefined(subFieldName) ? { subField: subFieldName } : {}),
          },
          objectMetadataItem,
          positionInGroup: simpleRecordFilters.length,
        });

        if (isDefined(recordFilter)) {
          simpleRecordFilters.push(recordFilter);
        }
      }
    }
  }

  const filterGroupQueryParams = queryParamsValidation.data.filterGroup;

  if (!isDefined(filterGroupQueryParams)) {
    return {
      recordFilters: simpleRecordFilters,
      recordFilterGroups: [],
    };
  }

  const { recordFilters, recordFilterGroups } =
    deserializeUrlRecursiveFilterGroup({
      urlRecursiveFilterGroup: filterGroupQueryParams,
      objectMetadataItem,
      positionInParent: 0,
    });

  return {
    recordFilters: [...simpleRecordFilters, ...recordFilters],
    recordFilterGroups,
  };
};
