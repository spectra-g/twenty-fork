import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { activeDashboardPresetComponentState } from '@/page-layout/states/activeDashboardPresetComponentState';
import { getSearchParamsFromDashboardFilters } from '@/page-layout/hooks/useDashboardUrlFilters';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { getDashboardFilterObjectMetadataItem } from '@/page-layout/utils/getDashboardFilterObjectMetadataItem';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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
  const activeDashboardPreset = useAtomComponentStateValue(
    activeDashboardPresetComponentState,
  );
  const setActiveDashboardPreset = useSetAtomComponentState(
    activeDashboardPresetComponentState,
  );

  const objectMetadataItem = getDashboardFilterObjectMetadataItem({
    pageLayout,
    objectMetadataItems,
  });

  useEffect(() => {
    if (
      activeDashboardPreset !== null &&
      isDeeplyEqual(dashboardFilters, activeDashboardPreset.filterState)
    ) {
      const nextSearchParams = new URLSearchParams(searchParams);

      Array.from(nextSearchParams.keys()).forEach((key) => {
        if (key.startsWith('filter[') || key.startsWith('filterGroup[')) {
          nextSearchParams.delete(key);
        }
      });
      nextSearchParams.set('preset', activeDashboardPreset.id);

      if (nextSearchParams.toString() !== searchParams.toString()) {
        setSearchParams(nextSearchParams, { replace: true });
      }

      return;
    }

    const nextSearchParams = getSearchParamsFromDashboardFilters({
      searchParams,
      filterState: dashboardFilters,
      objectMetadataItem,
    });

    if (activeDashboardPreset !== null) {
      nextSearchParams.delete('preset');
      setActiveDashboardPreset(null);
    }

    if (nextSearchParams.toString() === searchParams.toString()) {
      return;
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [
    activeDashboardPreset,
    dashboardFilters,
    objectMetadataItem,
    searchParams,
    setActiveDashboardPreset,
    setSearchParams,
  ]);

  return null;
};
