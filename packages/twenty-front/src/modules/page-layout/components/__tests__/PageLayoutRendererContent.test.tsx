import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import qs from 'qs';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { resetJotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  PageLayoutType,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

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

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockUseAtomComponentStateValue(),
  }),
);

jest.mock('@/page-layout/hooks/useCreatePageLayoutTab', () => ({
  useCreatePageLayoutTab: () => mockUseCreatePageLayoutTab(),
}));

jest.mock('@/page-layout/hooks/useReorderPageLayoutTabs', () => ({
  useReorderPageLayoutTabs: () => mockUseReorderPageLayoutTabs(),
}));

jest.mock(
  '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu',
  () => ({
    useNavigatePageLayoutCommandMenu: () =>
      mockUseNavigatePageLayoutCommandMenu(),
  }),
);

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => mockUseSetAtomComponentState(),
}));

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

jest.mock('@/page-layout/utils/getTabsWithVisibleWidgets', () => ({
  getTabsWithVisibleWidgets: (args: unknown) =>
    mockGetTabsWithVisibleWidgets(args),
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

const LocationSearch = () => {
  const location = useLocation();

  return (
    <div data-testid="location-search">
      {location.search.replace(/^\?/, '')}
    </div>
  );
};

const renderComponent = ({
  initialEntry = '/dashboard',
}: {
  initialEntry?: string;
} = {}) => {
  const store = resetJotaiStore();

  store.set(currentUserState.atom, {
    id: 'user-1',
    email: 'user-1@example.com',
    firstName: 'Test',
    lastName: 'User',
    supportUserHash: null,
    canAccessFullAdminPanel: false,
    canImpersonate: false,
    onboardingStatus: null,
    userVars: null,
    hasPassword: true,
  });
  store.set(currentWorkspaceState.atom, {
    id: 'workspace-1',
    inviteHash: null,
    logo: null,
    displayName: 'Workspace',
    allowImpersonation: false,
    featureFlags: [],
    activationStatus: 'ACTIVE',
    billingSubscriptions: [],
    billingEntitlements: [],
    currentBillingSubscription: null,
    workspaceMembersCount: 1,
    isPublicInviteLinkEnabled: false,
    isGoogleAuthEnabled: false,
    isGoogleAuthBypassEnabled: false,
    isMicrosoftAuthEnabled: false,
    isMicrosoftAuthBypassEnabled: false,
    isPasswordAuthEnabled: true,
    isPasswordAuthBypassEnabled: false,
    isCustomDomainEnabled: false,
    hasValidEnterpriseKey: false,
    subdomain: 'workspace',
    customDomain: null,
    workspaceUrls: {
      subdomainUrl: 'https://workspace.example.com',
      customUrl: null,
    },
    metadataVersion: 1,
    isTwoFactorAuthenticationEnforced: false,
    trashRetentionDays: 30,
    eventLogRetentionDays: 30,
    fastModel: 'gpt-4.1-mini',
    smartModel: 'gpt-4.1',
    aiAdditionalInstructions: null,
    editableProfileFields: [],
    autoEnableNewAiModels: false,
    disabledAiModelIds: [],
    enabledAiModelIds: [],
    useRecommendedModels: true,
    defaultRole: null,
    workspaceCustomApplication: null,
  });
  store.set(currentUserWorkspaceState.atom, {
    permissionFlags: [PermissionFlagType.LAYOUTS],
    twoFactorAuthenticationMethodSummary: null,
    objectsPermissions: [],
  });

  return render(
    <MemoryRouter
      initialEntries={[initialEntry]}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <JotaiProvider store={store}>
        <PageLayoutRendererContent />
        <LocationSearch />
      </JotaiProvider>
    </MemoryRouter>,
  );
};

describe('PageLayoutRendererContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

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

  it('hides the dashboard filter controls when the user lacks layouts permission', () => {
    const store = resetJotaiStore();

    store.set(currentUserState.atom, {
      id: 'user-1',
      email: 'user-1@example.com',
      firstName: 'Test',
      lastName: 'User',
      supportUserHash: null,
      canAccessFullAdminPanel: false,
      canImpersonate: false,
      onboardingStatus: null,
      userVars: null,
      hasPassword: true,
    });
    store.set(currentWorkspaceState.atom, {
      id: 'workspace-1',
      inviteHash: null,
      logo: null,
      displayName: 'Workspace',
      allowImpersonation: false,
      featureFlags: [],
      activationStatus: 'ACTIVE',
      billingSubscriptions: [],
      billingEntitlements: [],
      currentBillingSubscription: null,
      workspaceMembersCount: 1,
      isPublicInviteLinkEnabled: false,
      isGoogleAuthEnabled: false,
      isGoogleAuthBypassEnabled: false,
      isMicrosoftAuthEnabled: false,
      isMicrosoftAuthBypassEnabled: false,
      isPasswordAuthEnabled: true,
      isPasswordAuthBypassEnabled: false,
      isCustomDomainEnabled: false,
      hasValidEnterpriseKey: false,
      subdomain: 'workspace',
      customDomain: null,
      workspaceUrls: {
        subdomainUrl: 'https://workspace.example.com',
        customUrl: null,
      },
      metadataVersion: 1,
      isTwoFactorAuthenticationEnforced: false,
      trashRetentionDays: 30,
      eventLogRetentionDays: 30,
      fastModel: 'gpt-4.1-mini',
      smartModel: 'gpt-4.1',
      aiAdditionalInstructions: null,
      editableProfileFields: [],
      autoEnableNewAiModels: false,
      disabledAiModelIds: [],
      enabledAiModelIds: [],
      useRecommendedModels: true,
      defaultRole: null,
      workspaceCustomApplication: null,
    });
    store.set(currentUserWorkspaceState.atom, {
      permissionFlags: [],
      twoFactorAuthenticationMethodSummary: null,
      objectsPermissions: [],
    });

    render(
      <MemoryRouter
        initialEntries={['/dashboard']}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <JotaiProvider store={store}>
          <PageLayoutRendererContent />
          <LocationSearch />
        </JotaiProvider>
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole('button', { name: 'Filters' }),
    ).not.toBeInTheDocument();
  });

  it('disables saving a preset until the name is non-empty and lists the saved preset', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Filters' }));

    const saveButton = screen.getByRole('button', { name: 'Save as Preset' });

    expect(saveButton).toBeDisabled();

    await user.type(screen.getByLabelText('Preset name'), '   ');
    expect(saveButton).toBeDisabled();

    await user.clear(screen.getByLabelText('Preset name'));
    await user.type(
      screen.getByLabelText('Preset name'),
      'Quarter close owners',
    );

    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    expect(
      screen.getByRole('button', { name: 'Apply preset Quarter close owners' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Rename preset Quarter close owners',
      }),
    ).toBeInTheDocument();
  });

  it('renames and reapplies a saved preset from the dashboard filters panel', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.selectOptions(screen.getByLabelText('Owner'), 'owner-2');
    await user.type(screen.getByLabelText('Start date'), '2026-02-01');
    await user.type(screen.getByLabelText('End date'), '2026-02-28');
    await user.selectOptions(screen.getByLabelText('Stage'), 'NEW');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await user.type(screen.getByLabelText('Preset name'), 'Initial preset');
    await user.click(screen.getByRole('button', { name: 'Save as Preset' }));

    await user.click(
      screen.getByRole('button', { name: 'Rename preset Initial preset' }),
    );

    const confirmRenameButton = screen.getByRole('button', {
      name: 'Confirm rename',
    });

    expect(confirmRenameButton).toBeDisabled();

    await user.type(screen.getByLabelText('Rename preset'), '   ');
    expect(confirmRenameButton).toBeDisabled();

    await user.clear(screen.getByLabelText('Rename preset'));
    await user.type(screen.getByLabelText('Rename preset'), 'Renamed preset');
    expect(confirmRenameButton).toBeEnabled();

    await user.click(confirmRenameButton);

    expect(
      screen.getByRole('button', { name: 'Apply preset Renamed preset' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Apply preset Initial preset' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    await user.click(
      screen.getByRole('button', { name: 'Apply preset Renamed preset' }),
    );

    expect(screen.getByLabelText('Owner')).toHaveValue('owner-2');
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-02-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2026-02-28');
    expect(screen.getByLabelText('Stage')).toHaveValue('NEW');
  });

  it('serializes applied dashboard filters into the URL while preserving unrelated query params', async () => {
    const user = userEvent.setup();

    renderComponent({
      initialEntry: '/dashboard?tab=overview',
    });

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.selectOptions(screen.getByLabelText('Owner'), 'owner-1');
    await user.type(screen.getByLabelText('Start date'), '2026-03-01');
    await user.type(screen.getByLabelText('End date'), '2026-03-31');
    await user.selectOptions(screen.getByLabelText('Stage'), 'QUALIFIED');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(
      qs.parse(screen.getByTestId('location-search').textContent ?? ''),
    ).toEqual({
      tab: 'overview',
      filter: {
        'owner.workspaceMemberId': {
          IS: JSON.stringify({
            isCurrentWorkspaceMemberSelected: false,
            selectedRecordIds: ['owner-1'],
          }),
        },
        closeDate: {
          GREATER_THAN_OR_EQUAL: '2026-03-01',
          LESS_THAN_OR_EQUAL: '2026-03-31',
        },
        stage: {
          IS: 'QUALIFIED',
        },
      },
    });
  });

  it('hydrates dashboard filters from the URL when the dashboard page loads', async () => {
    const user = userEvent.setup();

    renderComponent({
      initialEntry:
        '/dashboard?filter[owner.workspaceMemberId][IS]=%7B%22isCurrentWorkspaceMemberSelected%22%3Afalse%2C%22selectedRecordIds%22%3A%5B%22owner-2%22%5D%7D&filter[closeDate][GREATER_THAN_OR_EQUAL]=2026-02-01&filter[closeDate][LESS_THAN_OR_EQUAL]=2026-02-28&filter[stage][IS]=NEW',
    });

    await user.click(screen.getByRole('button', { name: 'Filters' }));

    expect(screen.getByLabelText('Owner')).toHaveValue('owner-2');
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-02-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2026-02-28');
    expect(screen.getByLabelText('Stage')).toHaveValue('NEW');
  });
});
