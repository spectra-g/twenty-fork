import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useDashboardFilters } from '@/dashboard/hooks/useDashboardFilters';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { buildFilterQueryParams } from '@/page-layout/widgets/graph/utils/buildFilterQueryParams';

const FILTER_QUERY_PARAM_PREFIXES = ['filter[', 'filterGroup['];

export const DashboardFiltersUrlEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { globalFilters, globalFilterGroups } = useDashboardFilters();
  const [searchParams, setSearchParams] = useSearchParams();

  const serializedFilterParams = useMemo(
    () =>
      buildFilterQueryParams({
        recordFilters: globalFilters,
        recordFilterGroups: globalFilterGroups,
        objectMetadataItem,
      }),
    [globalFilterGroups, globalFilters, objectMetadataItem],
  );

  useEffect(() => {
    const nextSearchParams = new URLSearchParams(searchParams);

    for (const key of Array.from(nextSearchParams.keys())) {
      if (
        FILTER_QUERY_PARAM_PREFIXES.some((prefix) => key.startsWith(prefix))
      ) {
        nextSearchParams.delete(key);
      }
    }

    for (const [key, value] of serializedFilterParams.entries()) {
      nextSearchParams.append(key, value);
    }

    if (nextSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(nextSearchParams, { replace: true });
    }
  }, [searchParams, serializedFilterParams, setSearchParams]);

  return null;
};
