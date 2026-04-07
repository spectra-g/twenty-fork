/* eslint-disable @nx/enforce-module-boundaries */
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getDashboardFiltersFromQueryParams } from '@/page-layout/utils/getDashboardFiltersFromQueryParams';
import { buildFilterQueryParams } from '@/page-layout/widgets/graph/utils/buildFilterQueryParams';
import { type ChartFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const removeDashboardFilterQueryParams = (searchParams: URLSearchParams) => {
  Array.from(searchParams.keys()).forEach((key) => {
    if (key.startsWith('filter[') || key.startsWith('filterGroup[')) {
      searchParams.delete(key);
    }
  });
};

export const getFiltersFromUrl = ({
  searchParams,
  objectMetadataItem,
}: {
  searchParams: URLSearchParams;
  objectMetadataItem: ObjectMetadataItem;
}): ChartFilter =>
  getDashboardFiltersFromQueryParams({
    searchParams,
    objectMetadataItem,
  });

export const getSearchParamsFromFilters = ({
  searchParams,
  filterState,
  objectMetadataItem,
}: {
  searchParams: URLSearchParams;
  filterState: ChartFilter;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const nextSearchParams = new URLSearchParams(searchParams);

  removeDashboardFilterQueryParams(nextSearchParams);

  const filterQueryParams = buildFilterQueryParams({
    recordFilters: filterState.recordFilters as Parameters<
      typeof buildFilterQueryParams
    >[0]['recordFilters'],
    recordFilterGroups: filterState.recordFilterGroups as Parameters<
      typeof buildFilterQueryParams
    >[0]['recordFilterGroups'],
    objectMetadataItem,
  });

  for (const [key, value] of filterQueryParams.entries()) {
    nextSearchParams.append(key, value);
  }

  return nextSearchParams;
};

export const getSearchParamsFromDashboardFilters = ({
  searchParams,
  filterState,
  objectMetadataItem,
}: {
  searchParams: URLSearchParams;
  filterState: ChartFilter;
  objectMetadataItem: ObjectMetadataItem | null;
}) => {
  const nextSearchParams = new URLSearchParams(searchParams);

  removeDashboardFilterQueryParams(nextSearchParams);

  if (!isDefined(objectMetadataItem)) {
    return nextSearchParams;
  }

  return getSearchParamsFromFilters({
    searchParams: nextSearchParams,
    filterState,
    objectMetadataItem,
  });
};
