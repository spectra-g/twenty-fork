import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useDashboardFilterPresets } from '@/dashboard-filters/hooks/useDashboardFilterPresets';
import { resetJotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const mockUseCurrentPageLayout = jest.fn();

jest.mock('@/page-layout/hooks/useCurrentPageLayout', () => ({
  useCurrentPageLayout: () => mockUseCurrentPageLayout(),
}));

const getWrapper = ({
  userId = 'user-1',
  workspaceId = 'workspace-1',
}: {
  userId?: string;
  workspaceId?: string;
} = {}) => {
  const store = resetJotaiStore();

  store.set(currentUserState.atom, {
    id: userId,
    email: `${userId}@example.com`,
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
    id: workspaceId,
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

  return ({ children }: { children: React.ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );
};

describe('useDashboardFilterPresets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockUseCurrentPageLayout.mockReturnValue({
      currentPageLayout: {
        id: 'dashboard-layout',
      },
    });
  });

  it('saves presets for the current workspace, dashboard, and user scope', () => {
    const { result } = renderHook(() => useDashboardFilterPresets(), {
      wrapper: getWrapper({ userId: 'user-1', workspaceId: 'workspace-1' }),
    });

    act(() => {
      result.current.savePreset({
        name: 'Quarter close owners',
        filters: {
          ownerId: 'owner-1',
          startDate: '2026-03-01',
          endDate: '2026-03-31',
          stageId: 'QUALIFIED',
        },
      });
    });

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0]?.name).toBe('Quarter close owners');
    expect(localStorage.getItem('dashboardFilterPresetsState')).toContain(
      'workspace-1:dashboard-layout:user-1',
    );
  });

  it('rejects empty and whitespace-only preset names', () => {
    const { result } = renderHook(() => useDashboardFilterPresets(), {
      wrapper: getWrapper(),
    });

    act(() => {
      result.current.savePreset({
        name: '',
        filters: {
          ownerId: 'owner-1',
          startDate: '',
          endDate: '',
          stageId: '',
        },
      });
      result.current.savePreset({
        name: '   ',
        filters: {
          ownerId: 'owner-1',
          startDate: '',
          endDate: '',
          stageId: '',
        },
      });
    });

    expect(result.current.presets).toEqual([]);
  });

  it('isolates presets by user within the same workspace and dashboard', () => {
    const { result: firstUserResult } = renderHook(
      () => useDashboardFilterPresets(),
      {
        wrapper: getWrapper({ userId: 'user-1', workspaceId: 'workspace-1' }),
      },
    );

    act(() => {
      firstUserResult.current.savePreset({
        name: 'User one preset',
        filters: {
          ownerId: '',
          startDate: '',
          endDate: '',
          stageId: 'NEW',
        },
      });
    });

    const { result: secondUserResult } = renderHook(
      () => useDashboardFilterPresets(),
      {
        wrapper: getWrapper({ userId: 'user-2', workspaceId: 'workspace-1' }),
      },
    );

    expect(secondUserResult.current.presets).toEqual([]);
    expect(localStorage.getItem('dashboardFilterPresetsState')).toContain(
      'workspace-1:dashboard-layout:user-1',
    );
    expect(localStorage.getItem('dashboardFilterPresetsState')).not.toContain(
      'workspace-1:dashboard-layout:user-2',
    );
  });

  it('renames only the matching preset and ignores invalid rename values', () => {
    const { result } = renderHook(() => useDashboardFilterPresets(), {
      wrapper: getWrapper(),
    });

    act(() => {
      result.current.savePreset({
        name: 'First preset',
        filters: {
          ownerId: 'owner-1',
          startDate: '',
          endDate: '',
          stageId: '',
        },
      });
      result.current.savePreset({
        name: 'Second preset',
        filters: {
          ownerId: 'owner-2',
          startDate: '',
          endDate: '',
          stageId: '',
        },
      });
    });

    const firstPresetId = result.current.presets[0]?.id ?? '';
    const secondPresetId = result.current.presets[1]?.id ?? '';

    act(() => {
      result.current.renamePreset(firstPresetId, 'Renamed preset');
      result.current.renamePreset(secondPresetId, '   ');
      result.current.renamePreset('missing-preset', 'Should not apply');
    });

    expect(result.current.presets).toEqual([
      expect.objectContaining({
        id: firstPresetId,
        name: 'Renamed preset',
      }),
      expect.objectContaining({
        id: secondPresetId,
        name: 'Second preset',
      }),
    ]);
  });

  it('returns the saved filters when applying an existing preset and undefined for a missing preset', () => {
    const { result } = renderHook(() => useDashboardFilterPresets(), {
      wrapper: getWrapper(),
    });

    act(() => {
      result.current.savePreset({
        name: 'Saved filter set',
        filters: {
          ownerId: 'owner-2',
          startDate: '2026-02-01',
          endDate: '2026-02-28',
          stageId: 'NEW',
        },
      });
    });

    const presetId = result.current.presets[0]?.id ?? '';

    expect(result.current.applyPreset(presetId)).toEqual({
      ownerId: 'owner-2',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      stageId: 'NEW',
    });
    expect(result.current.applyPreset('missing-preset')).toBeUndefined();
  });
});
