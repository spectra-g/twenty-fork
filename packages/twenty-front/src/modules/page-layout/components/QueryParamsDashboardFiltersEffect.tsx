import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getSearchParamsFromDashboardFilters } from '@/page-layout/hooks/useDashboardUrlFilters';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { getDashboardFilterObjectMetadataItem } from '@/page-layout/utils/getDashboardFilterObjectMetadataItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

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
    const nextSearchParams = getSearchParamsFromDashboardFilters({
      searchParams,
      filterState: dashboardFilters,
      objectMetadataItem,
    });

    if (nextSearchParams.toString() === searchParams.toString()) {
      return;
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [dashboardFilters, objectMetadataItem, searchParams, setSearchParams]);

  return null;
};
