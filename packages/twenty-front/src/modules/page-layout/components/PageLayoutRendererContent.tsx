import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { GlobalFilterBar } from '@/page-layout/components/GlobalFilterBar';
import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutFilters } from '@/page-layout/hooks/usePageLayoutFilters';
import { useReorderPageLayoutTabs } from '@/page-layout/hooks/useReorderPageLayoutTabs';
import { PageLayoutMainContent } from '@/page-layout/PageLayoutMainContent';
import { type GlobalFilterConfig } from '@/page-layout/types/PageLayoutConfig';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { getScrollWrapperInstanceIdFromPageLayoutId } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutId';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { getTabsWithVisibleWidgets } from '@/page-layout/utils/getTabsWithVisibleWidgets';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { CommandMenuPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { PageLayoutType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div<{ hasPinnedTab: boolean }>`
  display: grid;
  grid-template-columns: ${({ hasPinnedTab }) =>
    hasPinnedTab ? `${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px 1fr` : '1fr'};
  grid-template-rows: minmax(0, 1fr);
  height: 100%;
  width: 100%;
`;

const StyledTabsAndDashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledPageLayoutTabList = styled(PageLayoutTabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  flex: 1;
`;

type PageLayoutWithGlobalFilterConfig = {
  globalFilterConfig?: GlobalFilterConfig;
  objectMetadataId?: string | null;
};

export const PageLayoutRendererContent = () => {
  const { currentPageLayout } = useCurrentPageLayout();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { isInRightDrawer, layoutType, targetRecordIdentifier } =
    useLayoutRenderingContext();

  const isPageLayoutInEditMode = useAtomComponentStateValue(
    isPageLayoutInEditModeComponentState,
  );

  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);

  const { createPageLayoutTab } = useCreatePageLayoutTab(currentPageLayout?.id);
  const { reorderTabs } = useReorderPageLayoutTabs(currentPageLayout?.id ?? '');
  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
  );
  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const isMobile = useIsMobile();

  if (!isDefined(currentPageLayout)) {
    return null;
  }

  const handleAddTab =
    isPageLayoutInEditMode &&
    shouldEnableTabEditingFeatures(currentPageLayout.type)
      ? () => {
          const newTabId = createPageLayoutTab(t`Untitled`);
          setPageLayoutTabSettingsOpenTabId(newTabId);
          navigatePageLayoutCommandMenu({
            commandMenuPage: CommandMenuPages.PageLayoutTabSettings,
            focusTitleInput: true,
          });
        }
      : undefined;

  const canEnableTabEditing =
    isPageLayoutInEditMode &&
    shouldEnableTabEditingFeatures(currentPageLayout.type);

  const tabsWithVisibleWidgets = getTabsWithVisibleWidgets({
    tabs: currentPageLayout.tabs,
    isMobile,
    isInRightDrawer,
    isEditMode: isPageLayoutInEditMode,
  });

  const { tabsToRenderInTabList, pinnedLeftTab } = getTabsByDisplayMode({
    tabs: tabsWithVisibleWidgets,
    pageLayoutType: currentPageLayout.type,
    isMobile,
    isInRightDrawer,
  });

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId: currentPageLayout.id,
    layoutType,
    targetRecordIdentifier,
  });

  const sortedTabs = sortTabsByPosition(tabsToRenderInTabList);
  const globalFilterConfig = (
    currentPageLayout as typeof currentPageLayout & PageLayoutWithGlobalFilterConfig
  ).globalFilterConfig;
  const objectMetadataId = (
    currentPageLayout as typeof currentPageLayout & PageLayoutWithGlobalFilterConfig
  ).objectMetadataId;

  const dashboardPermissions = isDefined(objectMetadataId)
    ? getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        objectMetadataId,
      )
    : undefined;
  const canUpdateDashboard = dashboardPermissions?.canUpdateObjectRecords ?? true;

  const {
    activePresetId,
    activePreset,
    refreshKey: filterRefreshKey,
    applyPreset,
  } = usePageLayoutFilters(globalFilterConfig);

  return (
    <StyledContainer hasPinnedTab={isDefined(pinnedLeftTab)}>
      {isDefined(pinnedLeftTab) && (
        <PageLayoutLeftPanel pinnedLeftTabId={pinnedLeftTab.id} />
      )}

      <StyledTabsAndDashboardContainer>
        <PageLayoutTabListEffect
          tabs={sortedTabs}
          componentInstanceId={tabListInstanceId}
          defaultTabToFocusOnMobileAndSidePanelId={
            currentPageLayout.defaultTabToFocusOnMobileAndSidePanelId ??
            undefined
          }
        />
        {(sortedTabs.length > 1 || isPageLayoutInEditMode) && (
          <StyledPageLayoutTabList
            tabs={sortedTabs}
            behaveAsLinks={!isInRightDrawer && !isPageLayoutInEditMode}
            componentInstanceId={tabListInstanceId}
            onAddTab={handleAddTab}
            isReorderEnabled={canEnableTabEditing}
            onReorder={canEnableTabEditing ? reorderTabs : undefined}
            pageLayoutType={currentPageLayout.type}
          />
        )}

        {currentPageLayout.type === PageLayoutType.DASHBOARD &&
          globalFilterConfig?.enabled && (
            <GlobalFilterBar
              presets={globalFilterConfig.presets}
              activePresetId={activePresetId}
              canUpdate={canUpdateDashboard}
              onPresetChange={applyPreset}
            />
          )}

        <StyledScrollWrapper
          componentInstanceId={getScrollWrapperInstanceIdFromPageLayoutId(
            currentPageLayout.id,
          )}
          defaultEnableXScroll={false}
        >
          <div
            data-testid="dashboard-widget-content"
            data-filter-refresh-key={filterRefreshKey}
            data-active-preset-id={activePreset?.id ?? ''}
          >
            {isDefined(activeTabId) && (
              <PageLayoutMainContent
                key={`${activeTabId}-${filterRefreshKey}`}
                tabId={activeTabId}
              />
            )}
          </div>
        </StyledScrollWrapper>
      </StyledTabsAndDashboardContainer>
    </StyledContainer>
  );
};
