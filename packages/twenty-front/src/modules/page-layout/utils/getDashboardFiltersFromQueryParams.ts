/* eslint-disable @nx/enforce-module-boundaries */
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { filterUrlQueryParamsSchema } from '@/views/schemas/filterUrlQueryParamsSchema';
import { convertUrlSingleFilterToRecordFilter } from '@/views/utils/convertUrlSingleFilterToRecordFilter';
import { deserializeUrlRecursiveFilterGroup } from '@/views/utils/deserializeUrlRecursiveFilterGroup';
import { splitFieldNameIntoBaseAndSubField } from '@/views/utils/splitFieldNameIntoBaseAndSubField';
import qs from 'qs';
import { type ChartFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getDashboardFiltersFromQueryParams = ({
  searchParams,
  objectMetadataItem,
}: {
  searchParams: URLSearchParams;
  objectMetadataItem: ObjectMetadataItem;
}): ChartFilter => {
  const parsedQueryParams = filterUrlQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  if (!parsedQueryParams.success) {
    return {
      recordFilters: [],
      recordFilterGroups: [],
    };
  }

  const recordFilters: RecordFilter[] = [];
  let positionInGroup = 0;

  const filterQueryParams = parsedQueryParams.data.filter;

  if (isDefined(filterQueryParams)) {
    for (const [fieldName, filterFromUrl] of Object.entries(
      filterQueryParams,
    )) {
      const { baseFieldName, subFieldName } =
        splitFieldNameIntoBaseAndSubField(fieldName);

      for (const [operand, value] of Object.entries(filterFromUrl)) {
        const serializedValue =
          Array.isArray(value) || typeof value === 'object'
            ? JSON.stringify(value)
            : value;

        const recordFilter = convertUrlSingleFilterToRecordFilter({
          urlSingleFilter: {
            field: baseFieldName,
            op: operand,
            value: serializedValue,
            subField: subFieldName,
          },
          objectMetadataItem,
          positionInGroup: positionInGroup++,
        });

        if (isDefined(recordFilter)) {
          recordFilters.push(recordFilter);
        }
      }
    }
  }

  const filterGroupQueryParams = parsedQueryParams.data.filterGroup;

  if (!isDefined(filterGroupQueryParams)) {
    return {
      recordFilters,
      recordFilterGroups: [],
    };
  }

  const filterGroupResult = deserializeUrlRecursiveFilterGroup({
    urlRecursiveFilterGroup: filterGroupQueryParams,
    objectMetadataItem,
    positionInParent: 0,
  });

  return {
    recordFilters: [...recordFilters, ...filterGroupResult.recordFilters],
    recordFilterGroups: filterGroupResult.recordFilterGroups,
  };
};
