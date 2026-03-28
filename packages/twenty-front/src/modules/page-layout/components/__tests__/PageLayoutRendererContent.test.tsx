import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';

import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { resetJotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { PageLayoutType } from '~/generated-metadata/graphql';

const mockUseCurrentPageLayout = jest.fn();
const mockUseLayoutRenderingContext = jest.fn();
const mockUseAtomComponentStateValue = jest.fn();
const mockUseCreatePageLayoutTab = jest.fn();
const mockUseReorderPageLayoutTabs = jest.fn();
const mockUseNavigatePageLayoutCommandMenu = jest.fn();
const mockUseSetAtomComponentState = jest.fn();
const mockUseIsMobile = jest.fn();
const mockGetTabsWithVisibleWidgets = jest.fn();
const mockGetTabsByDisplayMode = jest.fn();
const mockSortTabsByPosition = jest.fn();
const mockShouldEnableTabEditingFeatures = jest.fn();

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

jest.mock('@/page-layout/hooks/useCurrentPageLayout', () => ({
  useCurrentPageLayout: () => mockUseCurrentPageLayout(),
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => mockUseLayoutRenderingContext(),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue', () => ({
  useAtomComponentStateValue: () => mockUseAtomComponentStateValue(),
}));

jest.mock('@/page-layout/hooks/useCreatePageLayoutTab', () => ({
  useCreatePageLayoutTab: () => mockUseCreatePageLayoutTab(),
}));

jest.mock('@/page-layout/hooks/useReorderPageLayoutTabs', () => ({
  useReorderPageLayoutTabs: () => mockUseReorderPageLayoutTabs(),
}));

jest.mock('@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu', () => ({
  useNavigatePageLayoutCommandMenu: () => mockUseNavigatePageLayoutCommandMenu(),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => mockUseSetAtomComponentState(),
}));

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

jest.mock('@/page-layout/utils/getTabsWithVisibleWidgets', () => ({
  getTabsWithVisibleWidgets: (args: unknown) => mockGetTabsWithVisibleWidgets(args),
}));

jest.mock('@/page-layout/utils/getTabsByDisplayMode', () => ({
  getTabsByDisplayMode: (args: unknown) => mockGetTabsByDisplayMode(args),
}));

jest.mock('@/page-layout/utils/sortTabsByPosition', () => ({
  sortTabsByPosition: (tabs: unknown) => mockSortTabsByPosition(tabs),
}));

jest.mock('@/page-layout/utils/shouldEnableTabEditingFeatures', () => ({
  shouldEnableTabEditingFeatures: (...args: unknown[]) =>
    mockShouldEnableTabEditingFeatures(...args),
}));

const renderComponent = () => {
  const store = resetJotaiStore();

  return render(
    <JotaiProvider store={store}>
      <PageLayoutRendererContent />
    </JotaiProvider>,
  );
};

describe('PageLayoutRendererContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCurrentPageLayout.mockReturnValue({
      currentPageLayout: {
        id: 'dashboard-layout',
        type: PageLayoutType.DASHBOARD,
        tabs: [{ id: 'tab-1', position: 0 }],
      },
    });
    mockUseLayoutRenderingContext.mockReturnValue({
      isInRightDrawer: false,
      layoutType: PageLayoutType.DASHBOARD,
      targetRecordIdentifier: undefined,
    });
    mockUseAtomComponentStateValue
      .mockReturnValueOnce(false)
      .mockReturnValueOnce('tab-1');
    mockUseCreatePageLayoutTab.mockReturnValue({
      createPageLayoutTab: jest.fn(),
    });
    mockUseReorderPageLayoutTabs.mockReturnValue({
      reorderTabs: jest.fn(),
    });
    mockUseNavigatePageLayoutCommandMenu.mockReturnValue({
      navigatePageLayoutCommandMenu: jest.fn(),
    });
    mockUseSetAtomComponentState.mockReturnValue(jest.fn());
    mockUseIsMobile.mockReturnValue(false);
    mockGetTabsWithVisibleWidgets.mockImplementation(({ tabs }) => tabs);
    mockGetTabsByDisplayMode.mockImplementation(({ tabs }) => ({
      tabsToRenderInTabList: tabs,
      pinnedLeftTab: undefined,
    }));
    mockSortTabsByPosition.mockImplementation((tabs) => tabs);
    mockShouldEnableTabEditingFeatures.mockReturnValue(false);
  });

  it('shows dashboard filters with empty controls when the panel is opened', async () => {
    const user = userEvent.setup();

    renderComponent();

    expect(screen.queryByLabelText('Owner')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filters' }));

    expect(screen.getByLabelText('Owner')).toHaveValue('');
    expect(screen.getByLabelText('Start date')).toHaveValue('');
    expect(screen.getByLabelText('End date')).toHaveValue('');
    expect(screen.getByLabelText('Stage')).toHaveValue('');
  });
});
