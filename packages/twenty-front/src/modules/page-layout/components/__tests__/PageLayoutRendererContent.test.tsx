import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { PageLayoutType } from '~/generated-metadata/graphql';

const mockCurrentPageLayout = {
  id: 'page-layout-id',
  type: PageLayoutType.DASHBOARD,
  tabs: [
    { id: 'tab-1', position: 0 },
    { id: 'tab-2', position: 1 },
  ],
  defaultTabToFocusOnMobileAndSidePanelId: null,
};

jest.mock(
  '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu',
  () => ({
    useNavigatePageLayoutCommandMenu: () => ({
      navigatePageLayoutCommandMenu: jest.fn(),
    }),
  }),
);

jest.mock('@/page-layout/components/PageLayoutLeftPanel', () => ({
  PageLayoutLeftPanel: () => <div data-testid="page-layout-left-panel" />,
}));

jest.mock('@/dashboard/hooks/usePageLayoutGlobalFilters', () => {
  const ReactModule = jest.requireActual('react') as typeof React;

  return {
    usePageLayoutGlobalFilters: () => {
      const [activeFilters, setActiveFilters] = ReactModule.useState<
        Array<{ field: string; label: string; value: string }>
      >([]);

      return {
        availableFilters: [
          {
            field: 'status',
            label: 'Status',
            options: [{ value: 'Active Deals', label: 'Active Deals' }],
          },
          {
            field: 'owner',
            label: 'Owner',
            options: [{ value: 'Assigned to me', label: 'Assigned to me' }],
          },
        ],
        activeFilters,
        setFilterValue: (field: string, value: string) => {
          const label = field === 'status' ? 'Status' : 'Owner';

          setActiveFilters((currentFilters) => [
            ...currentFilters.filter(
              (activeFilter) => activeFilter.field !== field,
            ),
            { field, label, value },
          ]);
        },
        removeFilterValue: (field: string) => {
          setActiveFilters((currentFilters) =>
            currentFilters.filter(
              (activeFilter) => activeFilter.field !== field,
            ),
          );
        },
        clearFilters: () => setActiveFilters([]),
        presets: [],
        chartDataFilter: {
          recordFilters: [],
          recordFilterGroups: [],
        },
      };
    },
  };
});

jest.mock('@/page-layout/components/PageLayoutTabList', () => ({
  PageLayoutTabList: () => <div data-testid="dashboard-tabs" />,
}));

jest.mock('@/page-layout/components/PageLayoutTabListEffect', () => ({
  PageLayoutTabListEffect: () => null,
}));

jest.mock('@/page-layout/hooks/useCreatePageLayoutTab', () => ({
  useCreatePageLayoutTab: () => ({
    createPageLayoutTab: jest.fn(),
  }),
}));

jest.mock('@/page-layout/hooks/useCurrentPageLayout', () => ({
  useCurrentPageLayout: () => ({
    currentPageLayout: mockCurrentPageLayout,
  }),
}));

jest.mock('@/page-layout/hooks/useReorderPageLayoutTabs', () => ({
  useReorderPageLayoutTabs: () => ({
    reorderTabs: jest.fn(),
  }),
}));

jest.mock('@/page-layout/PageLayoutMainContent', () => ({
  PageLayoutMainContent: () => <div data-testid="page-layout-main-content" />,
}));

jest.mock('@/page-layout/states/isPageLayoutInEditModeComponentState', () => ({
  isPageLayoutInEditModeComponentState: 'isPageLayoutInEditModeComponentState',
}));

jest.mock(
  '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState',
  () => ({
    pageLayoutTabSettingsOpenTabIdComponentState:
      'pageLayoutTabSettingsOpenTabIdComponentState',
  }),
);

jest.mock(
  '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutId',
  () => ({
    getScrollWrapperInstanceIdFromPageLayoutId: () => 'scroll-wrapper-id',
  }),
);

jest.mock(
  '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord',
  () => ({
    getTabListInstanceIdFromPageLayoutAndRecord: () => 'tab-list-id',
  }),
);

jest.mock('@/page-layout/utils/getTabsByDisplayMode', () => ({
  getTabsByDisplayMode: () => ({
    tabsToRenderInTabList: mockCurrentPageLayout.tabs,
    pinnedLeftTab: null,
  }),
}));

jest.mock('@/page-layout/utils/getTabsWithVisibleWidgets', () => ({
  getTabsWithVisibleWidgets: () => mockCurrentPageLayout.tabs,
}));

jest.mock('@/page-layout/utils/shouldEnableTabEditingFeatures', () => ({
  shouldEnableTabEditingFeatures: () => true,
}));

jest.mock('@/page-layout/utils/sortTabsByPosition', () => ({
  sortTabsByPosition: (tabs: typeof mockCurrentPageLayout.tabs) => tabs,
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({
    isInRightDrawer: false,
    layoutType: PageLayoutType.DASHBOARD,
    targetRecordIdentifier: {
      id: 'record-id',
      targetObjectNameSingular: 'dashboard',
    },
  }),
}));

jest.mock('@/ui/layout/tab-list/states/activeTabIdComponentState', () => ({
  activeTabIdComponentState: 'activeTabIdComponentState',
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => jest.fn(),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (state: string) =>
      state === 'isPageLayoutInEditModeComponentState' ? false : 'tab-1',
  }),
);

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => false,
}));

const renderPageLayoutRendererContent = () =>
  render(
    <ThemeProvider
      theme={{
        spacing: (value: number) => `${value * 4}px`,
      }}
    >
      <PageLayoutRendererContent />
    </ThemeProvider>,
  );

describe('PageLayoutRendererContent', () => {
  it('renders the dashboard global filter bar for dashboard layouts', () => {
    mockCurrentPageLayout.type = PageLayoutType.DASHBOARD;

    renderPageLayoutRendererContent();

    expect(screen.getByTestId('dashboard-filter-bar')).toBeVisible();
    expect(screen.getByTestId('dashboard-tabs')).toBeVisible();
  });

  it('does not render the dashboard global filter bar for record page layouts', () => {
    mockCurrentPageLayout.type = PageLayoutType.RECORD_PAGE;

    renderPageLayoutRendererContent();

    expect(
      screen.queryByTestId('dashboard-filter-bar'),
    ).not.toBeInTheDocument();
  });

  it('shows a filter pill and update indicator when a dashboard filter is selected', async () => {
    mockCurrentPageLayout.type = PageLayoutType.DASHBOARD;

    const user = userEvent.setup();

    renderPageLayoutRendererContent();

    await user.selectOptions(
      screen.getByTestId('dashboard-filter-select-status'),
      'Active Deals',
    );

    expect(
      screen.getByTestId('dashboard-filter-pill-status-Active Deals'),
    ).toBeVisible();
    expect(
      screen.getByTestId('dashboard-global-filter-update-indicator'),
    ).toHaveTextContent('Filters updated');
    expect(
      screen.getByTestId('dashboard-global-filter-composition-indicator'),
    ).toHaveTextContent('Applied together with widget filters');
  });

  it('removes active filters individually and with clear all', async () => {
    mockCurrentPageLayout.type = PageLayoutType.DASHBOARD;

    const user = userEvent.setup();

    renderPageLayoutRendererContent();

    await user.selectOptions(
      screen.getByTestId('dashboard-filter-select-status'),
      'Active Deals',
    );
    await user.selectOptions(
      screen.getByTestId('dashboard-filter-select-owner'),
      'Assigned to me',
    );

    expect(
      screen.getByLabelText(
        'Filter: Status equals Active Deals, remove to clear',
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByTestId('dashboard-filter-pill-remove-status-Active Deals'),
    );

    expect(
      screen.queryByTestId('dashboard-filter-pill-status-Active Deals'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByTestId('dashboard-filter-clear-all'));

    expect(
      screen.queryByTestId('dashboard-filter-pill-owner-Assigned to me'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('dashboard-global-filter-update-indicator'),
    ).toHaveTextContent('No filters applied');
  });
});
