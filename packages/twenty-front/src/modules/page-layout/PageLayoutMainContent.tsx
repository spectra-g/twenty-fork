import { DashboardFilterBar } from '@/dashboards/components/DashboardFilterBar';
import { DashboardFilterRefreshIndicator } from '@/dashboards/components/DashboardFilterRefreshIndicator';
import { QueryParamsDashboardFiltersEffect } from '@/dashboards/components/QueryParamsDashboardFiltersEffect';
import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { getTabLayoutMode } from '@/page-layout/utils/getTabLayoutMode';
import { PageLayoutType } from '~/generated-metadata/graphql';

type PageLayoutMainContentProps = {
  tabId: string;
};

export const PageLayoutMainContent = ({
  tabId,
}: PageLayoutMainContentProps) => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const activeTab = usePageLayoutTabWithVisibleWidgetsOrThrow(tabId);

  const layoutMode = getTabLayoutMode({
    tab: activeTab,
    pageLayoutType: currentPageLayout.type,
  });

  return (
    <PageLayoutContentProvider
      value={{
        tabId,
        layoutMode,
      }}
    >
      {currentPageLayout.type === PageLayoutType.DASHBOARD ? (
        <>
          <QueryParamsDashboardFiltersEffect
            pageLayoutId={currentPageLayout.id}
          />
          <DashboardFilterBar pageLayoutId={currentPageLayout.id} />
          <DashboardFilterRefreshIndicator
            pageLayoutId={currentPageLayout.id}
          />
        </>
      ) : null}
      <PageLayoutContent />
    </PageLayoutContentProvider>
  );
};
