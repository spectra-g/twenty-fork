/* eslint-disable @nx/enforce-module-boundaries */
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getSearchParamsFromDashboardFilters } from '@/page-layout/hooks/useDashboardUrlFilters';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { getDashboardFilterObjectMetadataItem } from '@/page-layout/utils/getDashboardFilterObjectMetadataItem';
import { type ChartFilter } from 'twenty-shared/types';

export const useDashboardShareableUrl = ({
  pageLayout,
}: {
  pageLayout: PageLayout;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const getDashboardShareableUrl = (filterState: ChartFilter) => {
    const objectMetadataItem = getDashboardFilterObjectMetadataItem({
      pageLayout,
      objectMetadataItems,
    });

    const nextUrl = new URL(window.location.href);
    nextUrl.search = getSearchParamsFromDashboardFilters({
      searchParams: new URLSearchParams(window.location.search),
      filterState,
      objectMetadataItem,
    }).toString();

    return nextUrl.toString();
  };

  return {
    getDashboardShareableUrl,
  };
};
