import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { dashboardFiltersState } from '@/dashboards/states/dashboardFiltersAtom';
import { type DashboardFiltersState } from '@/dashboards/states/dashboardFiltersAtom';
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
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';
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

jest.mock(
  '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu',
  () => ({
    useNavigatePageLayoutCommandMenu: () => ({
      navigatePageLayoutCommandMenu: jest.fn(),
    }),
  }),
);

jest.mock('@/page-layout/utils/getTabsWithVisibleWidgets', () => ({
  getTabsWithVisibleWidgets: ({ tabs }: { tabs: unknown[] }) => tabs,
}));

jest.mock('@/page-layout/utils/getTabsByDisplayMode', () => ({
  getTabsByDisplayMode: ({ tabs }: { tabs: unknown[] }) => ({
    tabsToRenderInTabList: tabs,
    pinnedLeftTab: undefined,
  }),
}));

jest.mock('@/page-layout/utils/sortTabsByPosition', () => ({
  sortTabsByPosition: (tabs: unknown[]) => tabs,
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

const LocationSearchProbe = () => {
  const location = useLocation();

  return <div data-testid="location-search">{location.search}</div>;
};

const makePageLayout = () => ({
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  __typename: 'PageLayout' as const,
  name: 'Dashboard Layout',
  type: PageLayoutType.DASHBOARD,
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

const renderDashboardPageLayout = ({
  initialEntry = '/',
  initialDashboardFilters,
}: {
  initialEntry?: string;
  initialDashboardFilters?: DashboardFiltersState;
} = {}) => {
  const store = createStore();
  const pageLayout = makePageLayout();

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

  if (initialDashboardFilters) {
    store.set(dashboardFiltersState.atom, initialDashboardFilters);
  }

  return {
    store,
    ...render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <LayoutRenderingProvider
          value={{
            isInRightDrawer: false,
            layoutType: PageLayoutType.DASHBOARD,
            targetRecordIdentifier: undefined,
          }}
        >
          <PageLayoutTestWrapper store={store}>
            <LocationSearchProbe />
            <PageLayoutRendererContent />
          </PageLayoutTestWrapper>
        </LayoutRenderingProvider>
      </MemoryRouter>,
    ),
  };
};

describe('PageLayoutRendererContent dashboard filter URL state', () => {
  it('hydrates dashboard filters from URL query params and gives them precedence over existing state', async () => {
    renderDashboardPageLayout({
      initialEntry: `/?dashboardFilter[ownerId]=${mockWorkspaceMembers[1].id}&dashboardFilter[startDate]=2026-03-01&dashboardFilter[endDate]=2026-03-15&dashboardFilter[stage]=Proposal`,
      initialDashboardFilters: {
        pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        ownerId: mockWorkspaceMembers[0].id,
        ownerLabel: `${mockWorkspaceMembers[0].name.firstName} ${mockWorkspaceMembers[0].name.lastName}`,
        startDate: '2026-02-01',
        endDate: '2026-02-10',
        stage: 'Negotiation',
        refreshCount: 1,
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('owner-filter-dropdown')).toHaveValue(
        mockWorkspaceMembers[1].id,
      );
    });

    expect(screen.getByTestId('date-range-start-input')).toHaveValue(
      '2026-03-01',
    );
    expect(screen.getByTestId('date-range-end-input')).toHaveValue(
      '2026-03-15',
    );
    expect(screen.getByTestId('stage-filter')).toHaveValue('Proposal');
  });

  it('syncs dashboard filter changes back to the URL', async () => {
    const user = userEvent.setup();

    renderDashboardPageLayout();

    await user.selectOptions(
      screen.getByTestId('owner-filter-dropdown'),
      mockWorkspaceMembers[1].id,
    );
    await user.type(screen.getByTestId('date-range-start-input'), '2026-03-01');
    await user.type(screen.getByTestId('date-range-end-input'), '2026-03-15');
    await user.selectOptions(screen.getByTestId('stage-filter'), 'Proposal');

    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toHaveTextContent(
        /dashboardFilter(\[|%5B)ownerId(\]|%5D)=/,
      );
    });

    expect(screen.getByTestId('location-search')).toHaveTextContent(
      `dashboardFilter%5BownerId%5D=${mockWorkspaceMembers[1].id}`,
    );
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      'dashboardFilter%5BstartDate%5D=2026-03-01',
    );
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      'dashboardFilter%5BendDate%5D=2026-03-15',
    );
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      'dashboardFilter%5Bstage%5D=Proposal',
    );
  });
});
