import { render, screen } from '@testing-library/react';

import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { PageLayoutType } from '~/generated-metadata/graphql';

jest.mock('@/page-layout/hooks/useCurrentPageLayout');
jest.mock('@/ui/layout/contexts/LayoutRenderingContext');
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue');
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
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => jest.fn(),
}));
jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => false,
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
jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('PageLayoutRendererContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useLayoutRenderingContext as jest.Mock).mockReturnValue({
      isInRightDrawer: false,
      layoutType: PageLayoutType.DASHBOARD,
      targetRecordIdentifier: undefined,
    });

    (useAtomComponentStateValue as jest.Mock).mockImplementation((atom) => {
      if (atom === isPageLayoutInEditModeComponentState) {
        return false;
      }

      if (atom === activeTabIdComponentState) {
        return 'tab-1';
      }

      return undefined;
    });
  });

  it('shows the dashboard filter bar when filterSupport is true', () => {
    (useCurrentPageLayout as jest.Mock).mockReturnValue({
      currentPageLayout: {
        __typename: 'PageLayout',
        id: 'layout-1',
        name: 'Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: 'opportunity-object-id',
        filterSupport: true,
        createdAt: '2026-04-02T00:00:00.000Z',
        updatedAt: '2026-04-02T00:00:00.000Z',
        deletedAt: null,
        tabs: [
          {
            __typename: 'PageLayoutTab',
            id: 'tab-1',
            applicationId: 'app-1',
            title: 'Overview',
            icon: 'IconChartBar',
            position: 0,
            layoutMode: null,
            pageLayoutId: 'layout-1',
            createdAt: '2026-04-02T00:00:00.000Z',
            updatedAt: '2026-04-02T00:00:00.000Z',
            deletedAt: null,
            widgets: [],
          },
        ],
      },
    });

    render(<PageLayoutRendererContent />);

    expect(screen.getByTestId('dashboard-filter-bar')).toBeVisible();
  });

  it('hides the dashboard filter bar when filterSupport is false', () => {
    (useCurrentPageLayout as jest.Mock).mockReturnValue({
      currentPageLayout: {
        __typename: 'PageLayout',
        id: 'layout-1',
        name: 'Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: 'opportunity-object-id',
        filterSupport: false,
        createdAt: '2026-04-02T00:00:00.000Z',
        updatedAt: '2026-04-02T00:00:00.000Z',
        deletedAt: null,
        tabs: [
          {
            __typename: 'PageLayoutTab',
            id: 'tab-1',
            applicationId: 'app-1',
            title: 'Overview',
            icon: 'IconChartBar',
            position: 0,
            layoutMode: null,
            pageLayoutId: 'layout-1',
            createdAt: '2026-04-02T00:00:00.000Z',
            updatedAt: '2026-04-02T00:00:00.000Z',
            deletedAt: null,
            widgets: [],
          },
        ],
      },
    });

    render(<PageLayoutRendererContent />);

    expect(screen.queryByTestId('dashboard-filter-bar')).not.toBeInTheDocument();
  });

  it('hides the dashboard filter bar when filterSupport is undefined', () => {
    (useCurrentPageLayout as jest.Mock).mockReturnValue({
      currentPageLayout: {
        __typename: 'PageLayout',
        id: 'layout-1',
        name: 'Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: 'opportunity-object-id',
        createdAt: '2026-04-02T00:00:00.000Z',
        updatedAt: '2026-04-02T00:00:00.000Z',
        deletedAt: null,
        tabs: [
          {
            __typename: 'PageLayoutTab',
            id: 'tab-1',
            applicationId: 'app-1',
            title: 'Overview',
            icon: 'IconChartBar',
            position: 0,
            layoutMode: null,
            pageLayoutId: 'layout-1',
            createdAt: '2026-04-02T00:00:00.000Z',
            updatedAt: '2026-04-02T00:00:00.000Z',
            deletedAt: null,
            widgets: [],
          },
        ],
      },
    });

    render(<PageLayoutRendererContent />);

    expect(screen.queryByTestId('dashboard-filter-bar')).not.toBeInTheDocument();
  });
});
