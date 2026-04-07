/* eslint-disable @nx/enforce-module-boundaries */
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { getDashboardFilterObjectMetadataItem } from '@/page-layout/utils/getDashboardFilterObjectMetadataItem';
import { buildFilterQueryParams } from '@/page-layout/widgets/graph/utils/buildFilterQueryParams';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const QueryParamsDashboardFiltersEffect = ({
  pageLayout,
}: {
  pageLayout: PageLayout;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { objectMetadataItems } = useObjectMetadataItems();
  const dashboardFilters = useAtomComponentStateValue(
    dashboardFiltersComponentState,
  );

  const objectMetadataItem = getDashboardFilterObjectMetadataItem({
    pageLayout,
    objectMetadataItems,
  });

  useEffect(() => {
    if (!isDefined(objectMetadataItem)) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);

    Array.from(nextSearchParams.keys()).forEach((key) => {
      if (key.startsWith('filter[') || key.startsWith('filterGroup[')) {
        nextSearchParams.delete(key);
      }
    });

    const filterQueryParams = buildFilterQueryParams({
      recordFilters: dashboardFilters.recordFilters,
      recordFilterGroups: dashboardFilters.recordFilterGroups,
      objectMetadataItem,
    });

    for (const [key, value] of filterQueryParams.entries()) {
      nextSearchParams.append(key, value);
    }

    if (nextSearchParams.toString() === searchParams.toString()) {
      return;
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [dashboardFilters, objectMetadataItem, searchParams, setSearchParams]);

  return null;
};
