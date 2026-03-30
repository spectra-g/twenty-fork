import { DashboardFilterBar } from '@/dashboards/components/DashboardFilterBar';
import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { getTabLayoutMode } from '@/page-layout/utils/getTabLayoutMode';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';

type PageLayoutMainContentProps = {
  dashboardId?: string;
  tabId: string;
};

export const PageLayoutMainContent = ({
  dashboardId,
  tabId,
}: PageLayoutMainContentProps) => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const activeTab = usePageLayoutTabWithVisibleWidgetsOrThrow(tabId);
  const { layoutType, targetRecordIdentifier } = useLayoutRenderingContext();

  const layoutMode = getTabLayoutMode({
    tab: activeTab,
    pageLayoutType: currentPageLayout.type,
  });

  const resolvedDashboardId =
    dashboardId ??
    (layoutType === 'DASHBOARD' ? targetRecordIdentifier?.id : undefined);

  return (
    <PageLayoutContentProvider
      value={{
        tabId,
        layoutMode,
      }}
    >
      {currentPageLayout.type === 'DASHBOARD' && resolvedDashboardId ? (
        <DashboardFilterBar dashboardId={resolvedDashboardId} />
      ) : null}
      <PageLayoutContent />
    </PageLayoutContentProvider>
  );
};
