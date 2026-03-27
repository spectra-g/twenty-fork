import { t } from '@lingui/core/macro';
import { DashboardFilterBar } from '@/dashboards/components/DashboardFilterBar';
import { useDashboardUrlState } from '@/dashboards/hooks/useDashboardUrlState';
import { PageLayoutInitializationQueryEffect } from '@/page-layout/components/PageLayoutInitializationQueryEffect';
import { PageLayoutRelationWidgetsSyncEffect } from '@/page-layout/components/PageLayoutRelationWidgetsSyncEffect';
import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { isPageLayoutEmpty } from '@/page-layout/utils/isPageLayoutEmpty';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { PageLayoutType } from '~/generated-metadata/graphql';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

type PageLayoutRendererProps = {
  pageLayoutId: string;
};

export const PageLayoutRenderer = ({
  pageLayoutId,
}: PageLayoutRendererProps) => {
  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();
  const { presetId, restoredPreset, stageFilter } = useDashboardUrlState();

  const onInitialized = (pageLayout: PageLayout) => {
    if (isPageLayoutEmpty(pageLayout)) {
      setIsPageLayoutInEditMode(true);
    } else {
      setIsPageLayoutInEditMode(false);
    }
  };

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId,
    layoutType,
    targetRecordIdentifier,
  });

  return (
    <PageLayoutComponentInstanceContext.Provider
      value={{
        instanceId: pageLayoutId,
      }}
    >
      <TabListComponentInstanceContext.Provider
        value={{
          instanceId: tabListInstanceId,
        }}
      >
        {layoutType === PageLayoutType.DASHBOARD ? (
          <DashboardFilterBar
            filterDefinitions={[
              {
                id: 'stage',
                type: 'stage',
                label: t`Stage`,
                options: [
                  {
                    value: 'open',
                    label: t`Open`,
                  },
                  {
                    value: 'closed-won',
                    label: t`Closed Won`,
                  },
                ],
              },
            ]}
            initialPresets={restoredPreset ? [restoredPreset] : []}
            initialSelectedPresetId={presetId}
            initialStageFilter={stageFilter}
          />
        ) : null}
        <PageLayoutInitializationQueryEffect
          pageLayoutId={pageLayoutId}
          onInitialized={onInitialized}
        />
        <PageLayoutRelationWidgetsSyncEffect pageLayoutId={pageLayoutId} />
        <PageLayoutRendererContent />
      </TabListComponentInstanceContext.Provider>
    </PageLayoutComponentInstanceContext.Provider>
  );
};
