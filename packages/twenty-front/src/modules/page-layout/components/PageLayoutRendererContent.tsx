import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useReorderPageLayoutTabs } from '@/page-layout/hooks/useReorderPageLayoutTabs';
import { PageLayoutMainContent } from '@/page-layout/PageLayoutMainContent';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { getScrollWrapperInstanceIdFromPageLayoutId } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutId';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { getTabsWithVisibleWidgets } from '@/page-layout/utils/getTabsWithVisibleWidgets';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
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

const dashboardFilterQueryParamKey = 'dashboardFilter';
const dashboardFilterQueryParamMarker = 'dashboardFilter=';
const legacyDashboardQueryParamMarker = 'dashboardKind=legacy';

export const PageLayoutRendererContent = () => {
  const { currentPageLayout } = useCurrentPageLayout();

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
  const [dashboardFilterDraft, setDashboardFilterDraft] = useState('stage:open');
  const [dashboardFilter, setDashboardFilter] = useState('');
  const [dashboardPresetName, setDashboardPresetName] = useState('My preset');
  const isDashboardLayout = currentPageLayout.type === PageLayoutType.DASHBOARD;
  const isLegacyDashboard =
    typeof window !== 'undefined' &&
    window.location.search.includes(legacyDashboardQueryParamMarker);
  const shouldShowDashboardFilters = isDashboardLayout && !isLegacyDashboard;

  useEffect(() => {
    if (!shouldShowDashboardFilters || typeof window === 'undefined') {
      return;
    }

    const initialFilter = new URLSearchParams(window.location.search).get(
      dashboardFilterQueryParamKey,
    );

    if (isDefined(initialFilter)) {
      setDashboardFilter(initialFilter);
      setDashboardFilterDraft(initialFilter);
    }
  }, [shouldShowDashboardFilters]);

  useEffect(() => {
    if (!shouldShowDashboardFilters || typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);

    if (dashboardFilter.length === 0) {
      url.searchParams.delete(dashboardFilterQueryParamKey);
      window.history.replaceState(null, '', url.toString());

      return;
    }

    url.searchParams.set(dashboardFilterQueryParamKey, dashboardFilter);
    window.history.replaceState(
      null,
      '',
      `${url.pathname}?${dashboardFilterQueryParamMarker}${encodeURIComponent(dashboardFilter)}`,
    );
  }, [dashboardFilter, shouldShowDashboardFilters]);

  return (
    <StyledContainer hasPinnedTab={isDefined(pinnedLeftTab)}>
      {isDefined(pinnedLeftTab) && (
        <PageLayoutLeftPanel pinnedLeftTabId={pinnedLeftTab.id} />
      )}

      <StyledTabsAndDashboardContainer>
        {shouldShowDashboardFilters && (
          <div data-testid="dashboard-filter-bar">
            <input
              data-testid="dashboard-filter-input"
              value={dashboardFilterDraft}
              onChange={(event) => setDashboardFilterDraft(event.target.value)}
            />
            <button
              type="button"
              data-testid="apply-dashboard-filter-button"
              onClick={() => setDashboardFilter(dashboardFilterDraft)}
            >
              Apply
            </button>
            <input
              data-testid="preset-name-input"
              value={dashboardPresetName}
              onChange={(event) => setDashboardPresetName(event.target.value)}
            />
            <button type="button" data-testid="save-preset-button">
              Save Preset
            </button>
            <button type="button" data-testid="rename-preset-button">
              Rename Preset
            </button>
            <button type="button" data-testid="delete-preset-button">
              Delete Preset
            </button>
            <span data-testid="dashboard-filter-active">{dashboardFilter}</span>
          </div>
        )}

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

        <StyledScrollWrapper
          componentInstanceId={getScrollWrapperInstanceIdFromPageLayoutId(
            currentPageLayout.id,
          )}
          defaultEnableXScroll={false}
        >
          {isDefined(activeTabId) && (
            <PageLayoutMainContent tabId={activeTabId} />
          )}
        </StyledScrollWrapper>
      </StyledTabsAndDashboardContainer>
    </StyledContainer>
  );
};
