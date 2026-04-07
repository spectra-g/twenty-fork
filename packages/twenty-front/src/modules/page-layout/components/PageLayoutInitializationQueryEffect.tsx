/* eslint-disable @nx/enforce-module-boundaries */
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useBasePageLayout } from '@/page-layout/hooks/useBasePageLayout';
import { useDashboardPresetsApi } from '@/page-layout/hooks/useDashboardPresetsApi';
import { getFiltersFromUrl } from '@/page-layout/hooks/useDashboardUrlFilters';
import { usePageLayoutWithRelationWidgets } from '@/page-layout/hooks/usePageLayoutWithRelationWidgets';
import { activeDashboardPresetComponentState } from '@/page-layout/states/activeDashboardPresetComponentState';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { dashboardUrlErrorComponentState } from '@/page-layout/states/dashboardUrlErrorComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { getDashboardFilterObjectMetadataItem } from '@/page-layout/utils/getDashboardFilterObjectMetadataItem';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type PageLayoutInitializationQueryEffectProps = {
  pageLayoutId: string;
  onInitialized?: (pageLayout: PageLayout) => void;
};

export const PageLayoutInitializationQueryEffect = ({
  pageLayoutId,
  onInitialized,
}: PageLayoutInitializationQueryEffectProps) => {
  const [pageLayoutIsInitialized, setPageLayoutIsInitialized] =
    useAtomComponentState(pageLayoutIsInitializedComponentState);

  const basePageLayout = useBasePageLayout(pageLayoutId);

  const pageLayout = usePageLayoutWithRelationWidgets(basePageLayout);
  const { objectMetadataItems } = useObjectMetadataItems();
  const [searchParams] = useSearchParams();

  const pageLayoutPersistedComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutPersistedComponentState);

  const pageLayoutDraftComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutDraftComponentState);

  const pageLayoutCurrentLayoutsComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutCurrentLayoutsComponentState);
  const dashboardFiltersComponentCallbackState =
    useAtomComponentStateCallbackState(dashboardFiltersComponentState);
  const activeDashboardPresetComponentCallbackState =
    useAtomComponentStateCallbackState(activeDashboardPresetComponentState);
  const dashboardUrlErrorComponentCallbackState =
    useAtomComponentStateCallbackState(dashboardUrlErrorComponentState);

  const store = useStore();
  const { getDashboardPreset } = useDashboardPresetsApi(pageLayoutId);

  const initializePageLayout = useCallback(
    async (layout: PageLayout) => {
      const currentPersisted = store.get(
        pageLayoutPersistedComponentCallbackState,
      );

      if (!isDeeplyEqual(layout, currentPersisted)) {
        store.set(pageLayoutPersistedComponentCallbackState, layout);
        store.set(pageLayoutDraftComponentCallbackState, {
          id: layout.id,
          name: layout.name,
          type: layout.type,
          objectMetadataId: layout.objectMetadataId,
          tabs: layout.tabs,
        });

        const tabLayouts = convertPageLayoutToTabLayouts(layout);
        store.set(pageLayoutCurrentLayoutsComponentCallbackState, tabLayouts);
      }

      if (layout.type !== PageLayoutType.DASHBOARD) {
        return;
      }

      const objectMetadataItem = getDashboardFilterObjectMetadataItem({
        pageLayout: layout,
        objectMetadataItems,
      });

      if (!isDefined(objectMetadataItem)) {
        return;
      }

      store.set(dashboardUrlErrorComponentCallbackState, null);

      const presetId = searchParams.get('preset');

      if (isDefined(presetId) && presetId.length > 0) {
        try {
          const dashboardPreset = await getDashboardPreset(presetId);

          store.set(activeDashboardPresetComponentCallbackState, {
            id: dashboardPreset.id,
            name: dashboardPreset.name,
            filterState: dashboardPreset.filterState,
          });
          store.set(
            dashboardFiltersComponentCallbackState,
            dashboardPreset.filterState,
          );

          return;
        } catch {
          store.set(activeDashboardPresetComponentCallbackState, null);
          store.set(dashboardFiltersComponentCallbackState, {
            recordFilters: [],
            recordFilterGroups: [],
          });
          store.set(dashboardUrlErrorComponentCallbackState, {
            message: t`This preset is no longer available. The dashboard loaded without it.`,
          });

          return;
        }
      }

      store.set(activeDashboardPresetComponentCallbackState, null);

      try {
        const dashboardFilters = getFiltersFromUrl({
          searchParams,
          objectMetadataItem,
        });

        store.set(dashboardFiltersComponentCallbackState, dashboardFilters);
      } catch {
        store.set(dashboardFiltersComponentCallbackState, {
          recordFilters: [],
          recordFilterGroups: [],
        });
        store.set(dashboardUrlErrorComponentCallbackState, {
          message: t`This dashboard link contains invalid filter parameters. The dashboard loaded without them.`,
        });
      }
    },
    [
      activeDashboardPresetComponentCallbackState,
      dashboardFiltersComponentCallbackState,
      dashboardUrlErrorComponentCallbackState,
      getDashboardPreset,
      objectMetadataItems,
      pageLayoutCurrentLayoutsComponentCallbackState,
      pageLayoutDraftComponentCallbackState,
      pageLayoutPersistedComponentCallbackState,
      searchParams,
      store,
    ],
  );

  useEffect(() => {
    if (!pageLayoutIsInitialized && isDefined(pageLayout)) {
      void initializePageLayout(pageLayout).then(() => {
        onInitialized?.(pageLayout);
        setPageLayoutIsInitialized(true);
      });
    }
  }, [
    initializePageLayout,
    pageLayoutIsInitialized,
    pageLayout,
    onInitialized,
    setPageLayoutIsInitialized,
  ]);

  return null;
};
