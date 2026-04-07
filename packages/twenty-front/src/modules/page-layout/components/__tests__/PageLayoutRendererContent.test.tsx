import { DashboardFilterBar } from '@/page-layout/components/DashboardFilterBar';
import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { act, render, screen } from '@testing-library/react';
import { createStore } from 'jotai';
import { PageLayoutType } from '~/generated-metadata/graphql';

import { PAGE_LAYOUT_TEST_INSTANCE_ID } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';

jest.mock('@/page-layout/components/DashboardFilterBar', () => ({
  DashboardFilterBar: jest.fn(() => <div>dashboard-filter-bar</div>),
}));

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
  PageLayoutMainContent: () => <div>main-content</div>,
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({
    isInRightDrawer: false,
    layoutType: 'record-show-page',
    targetRecordIdentifier: 'record-id',
  }),
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

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => false,
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('PageLayoutRendererContent', () => {
  it('should render the dashboard filter bar only for dashboard layouts', () => {
    const store = createStore();

    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      {
        id: 'layout-id',
        name: 'Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            id: 'tab-1',
            title: 'Main',
            position: 0,
            applicationId: 'app-id',
            pageLayoutId: 'layout-id',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            deletedAt: null,
            widgets: [],
          },
        ],
      },
    );

    store.set(
      activeTabIdComponentState.atomFamily({
        instanceId: `${PAGE_LAYOUT_TEST_INSTANCE_ID}-tab-list`,
      }),
      'tab-1',
    );

    const { rerender } = render(
      <PageLayoutTestWrapper store={store}>
        <PageLayoutRendererContent />
      </PageLayoutTestWrapper>,
    );

    expect(screen.getByText('dashboard-filter-bar')).toBeVisible();
    expect(DashboardFilterBar).toHaveBeenCalledTimes(1);

    act(() => {
      store.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        {
          id: 'layout-id',
          name: 'Record',
          type: PageLayoutType.RECORD_PAGE,
          objectMetadataId: 'person-id',
          tabs: [
            {
              id: 'tab-1',
              title: 'Main',
              position: 0,
              applicationId: 'app-id',
              pageLayoutId: 'layout-id',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
              deletedAt: null,
              widgets: [],
            },
          ],
        },
      );
    });

    rerender(
      <PageLayoutTestWrapper store={store}>
        <PageLayoutRendererContent />
      </PageLayoutTestWrapper>,
    );

    expect(screen.queryByText('dashboard-filter-bar')).not.toBeInTheDocument();
  });
});
