import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { render, screen } from '@testing-library/react';
import { createStore } from 'jotai';
import { PageLayoutType } from '~/generated-metadata/graphql';

jest.mock('@/page-layout/components/PageLayoutLeftPanel', () => ({
  PageLayoutLeftPanel: () => <div>left-panel</div>,
}));

jest.mock('@/page-layout/components/PageLayoutTabList', () => ({
  PageLayoutTabList: () => <div>tab-list</div>,
}));

jest.mock('@/page-layout/components/PageLayoutTabListEffect', () => ({
  PageLayoutTabListEffect: () => null,
}));

jest.mock('@/page-layout/PageLayoutMainContent', () => ({
  PageLayoutMainContent: () => (
    <div data-testid="page-layout-main-content">main-content</div>
  ),
}));

jest.mock('@/page-layout/hooks/useCreatePageLayoutTab', () => ({
  useCreatePageLayoutTab: () => ({
    createPageLayoutTab: jest.fn(),
  }),
}));

jest.mock('@/page-layout/hooks/useReorderPageLayoutTabs', () => ({
  useReorderPageLayoutTabs: () => ({
    reorderTabs: jest.fn(),
  }),
}));

jest.mock('@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu', () => ({
  useNavigatePageLayoutCommandMenu: () => ({
    navigatePageLayoutCommandMenu: jest.fn(),
  }),
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('@/ui/utilities/responsive/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

describe('PageLayoutRendererContent', () => {
  it('should show the dashboard filter bar in view mode', () => {
    const pageLayoutId = 'dashboard-layout-id';
    const store = createStore();

    store.set(pageLayoutPersistedComponentState.atomFamily({ instanceId: pageLayoutId }), {
      id: pageLayoutId,
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: 'company-object-metadata-id',
      tabs: [
        {
          id: 'tab-1',
          title: 'Overview',
          position: 0,
          widgets: [],
        },
      ],
    });
    store.set(
      activeTabIdComponentState.atomFamily({
        instanceId: getTabListInstanceIdFromPageLayoutId(pageLayoutId),
      }),
      'tab-1',
    );

    render(
      <LayoutRenderingProvider
        value={{
          isInRightDrawer: false,
          layoutType: PageLayoutType.DASHBOARD,
          targetRecordIdentifier: undefined,
        }}
      >
        <PageLayoutTestWrapper instanceId={pageLayoutId} store={store}>
          <PageLayoutRendererContent />
        </PageLayoutTestWrapper>
      </LayoutRenderingProvider>,
    );

    expect(
      screen.getByRole('button', { name: 'Add filter' }),
    ).toBeInTheDocument();
  });
});
