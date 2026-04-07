/* eslint-disable @nx/enforce-module-boundaries */
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { getDashboardFilterObjectMetadataItem } from '@/page-layout/utils/getDashboardFilterObjectMetadataItem';
import { buildFilterQueryParams } from '@/page-layout/widgets/graph/utils/buildFilterQueryParams';
import { type ChartFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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

    const searchParams = new URLSearchParams(window.location.search);

    Array.from(searchParams.keys()).forEach((key) => {
      if (key.startsWith('filter[') || key.startsWith('filterGroup[')) {
        searchParams.delete(key);
      }
    });

    if (isDefined(objectMetadataItem)) {
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
        searchParams.append(key, value);
      }
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.search = searchParams.toString();

    return nextUrl.toString();
  };

  return {
    getDashboardShareableUrl,
  };
};
