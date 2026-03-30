import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

jest.mock('@/page-layout/components/PageLayoutLeftPanel', () => ({
  PageLayoutLeftPanel: () => <div data-testid="page-layout-left-panel" />,
}));

jest.mock('@/page-layout/components/PageLayoutTabList', () => ({
  PageLayoutTabList: () => <div data-testid="page-layout-tab-list" />,
}));

jest.mock('@/page-layout/components/PageLayoutTabListEffect', () => ({
  PageLayoutTabListEffect: () => null,
}));

jest.mock('@/page-layout/components/PageLayoutContent', () => ({
  PageLayoutContent: () => <div data-testid="page-layout-content" />,
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

jest.mock('@/page-layout/utils/getTabsWithVisibleWidgets', () => ({
  getTabsWithVisibleWidgets: ({ tabs }: { tabs: any[] }) => tabs,
}));

jest.mock('@/page-layout/utils/getTabsByDisplayMode', () => ({
  getTabsByDisplayMode: ({ tabs }: { tabs: any[] }) => ({
    tabsToRenderInTabList: tabs,
    pinnedLeftTab: undefined,
  }),
}));

jest.mock('@/page-layout/utils/sortTabsByPosition', () => ({
  sortTabsByPosition: (tabs: any[]) => tabs,
}));

jest.mock('@/page-layout/utils/shouldEnableTabEditingFeatures', () => ({
  shouldEnableTabEditingFeatures: () => false,
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-wrapper">{children}</div>
  ),
}));

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => false,
}));

const makePageLayout = (type: PageLayoutType) => ({
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  __typename: 'PageLayout' as const,
  name: 'Dashboard Layout',
  type,
  objectMetadataId: null,
  createdAt: '2026-03-30T00:00:00.000Z',
  updatedAt: '2026-03-30T00:00:00.000Z',
  defaultTabToFocusOnMobileAndSidePanelId: null,
  tabs: [
    {
      __typename: 'PageLayoutTab' as const,
      id: 'tab-1',
      applicationId: 'app-1',
      title: 'Overview',
      position: 0,
      pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      createdAt: '2026-03-30T00:00:00.000Z',
      updatedAt: '2026-03-30T00:00:00.000Z',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [],
    },
  ],
});

const renderPageLayoutRendererContent = (layoutType: PageLayoutType) => {
  const store = createStore();
  const pageLayout = makePageLayout(layoutType);

  store.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    pageLayout,
  );
  store.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    pageLayout,
  );
  store.set(
    activeTabIdComponentState.atomFamily({
      instanceId: getTabListInstanceIdFromPageLayoutId(
        PAGE_LAYOUT_TEST_INSTANCE_ID,
      ),
    }),
    'tab-1',
  );
  store.set(currentWorkspaceMembersState.atom, mockWorkspaceMembers);
  store.set(workspaceMemberFormatPreferencesState.atom, {
    timeZone: 'UTC',
    dateFormat: DateFormat.DAY_FIRST,
    timeFormat: TimeFormat.HOUR_24,
    numberFormat: 'COMMA_DOT' as never,
    calendarStartDay: 'MONDAY' as never,
  });

  return render(
    <LayoutRenderingProvider
      value={{
        isInRightDrawer: false,
        layoutType,
        targetRecordIdentifier: undefined,
      }}
    >
      <PageLayoutTestWrapper store={store}>
        <PageLayoutRendererContent />
      </PageLayoutTestWrapper>
    </LayoutRenderingProvider>,
  );
};

describe('PageLayoutRendererContent dashboard filter bar', () => {
  it('shows owner, date range, and stage controls on dashboard layouts', () => {
    renderPageLayoutRendererContent(PageLayoutType.DASHBOARD);

    expect(screen.getByTestId('dashboard-filter-bar')).toBeVisible();
    expect(screen.getByTestId('owner-filter-dropdown')).toBeVisible();
    expect(screen.getByTestId('date-range-filter')).toBeVisible();
    expect(screen.getByTestId('stage-filter')).toBeVisible();
  });

  it('changes owner and triggers the widget refresh contract', async () => {
    const user = userEvent.setup();

    renderPageLayoutRendererContent(PageLayoutType.DASHBOARD);

    await user.selectOptions(
      screen.getByTestId('owner-filter-dropdown'),
      mockWorkspaceMembers[1].id,
    );

    expect(screen.getByTestId('owner-filter-dropdown')).toHaveValue(
      mockWorkspaceMembers[1].id,
    );
    expect(screen.getAllByTestId('widget-refreshing')[0]).toHaveTextContent('1');
  });

  it('changes date range and triggers the widget refresh contract', async () => {
    const user = userEvent.setup();

    renderPageLayoutRendererContent(PageLayoutType.DASHBOARD);

    await user.type(screen.getByTestId('date-range-start-input'), '2026-03-01');
    await user.type(screen.getByTestId('date-range-end-input'), '2026-03-15');

    expect(screen.getByTestId('date-range-filter-value')).toHaveTextContent(
      '1 Mar, 2026 - 15 Mar, 2026',
    );
    expect(screen.getAllByTestId('widget-refreshing')[0]).toHaveTextContent('2');
  });

  it('does not render the filter bar on non-dashboard layouts', () => {
    renderPageLayoutRendererContent(PageLayoutType.RECORD_PAGE);

    expect(screen.queryByTestId('dashboard-filter-bar')).not.toBeInTheDocument();
  });
});
