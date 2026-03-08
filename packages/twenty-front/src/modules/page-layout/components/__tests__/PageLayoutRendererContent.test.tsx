import { render, screen } from '@testing-library/react';

import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { PageLayoutType } from '~/generated-metadata/graphql';

jest.mock('@/page-layout/components/PageLayoutLeftPanel', () => ({
  PageLayoutLeftPanel: () => <div data-testid="page-layout-left-panel" />,
}));

jest.mock('@/page-layout/components/PageLayoutTabList', () => ({
  PageLayoutTabList: () => <div data-testid="page-layout-tab-list" />,
}));

jest.mock('@/page-layout/components/PageLayoutTabListEffect', () => ({
  PageLayoutTabListEffect: () => null,
}));

jest.mock('@/page-layout/PageLayoutMainContent', () => ({
  PageLayoutMainContent: () => <div data-testid="main-content" />,
}));

jest.mock('@/page-layout/hooks/useCurrentPageLayout', () => ({
  useCurrentPageLayout: () => ({
    currentPageLayout: {
      id: 'layout-1',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: 'dashboard-object-id',
      tabs: [
        {
          id: 'tab-1',
          position: 0,
          widgets: [],
        },
      ],
      globalFilterConfig: {
        enabled: true,
        presets: [
          {
            id: 'default',
            name: 'Default',
            filters: [],
            filterGroups: [],
          },
        ],
      },
    },
  }),
}));

jest.mock('@/page-layout/hooks/useCreatePageLayoutTab', () => ({
  useCreatePageLayoutTab: () => ({
    createPageLayoutTab: jest.fn(() => 'new-tab-id'),
  }),
}));

jest.mock('@/page-layout/hooks/useReorderPageLayoutTabs', () => ({
  useReorderPageLayoutTabs: () => ({
    reorderTabs: jest.fn(),
  }),
}));

jest.mock('@/page-layout/hooks/usePageLayoutFilters', () => ({
  usePageLayoutFilters: () => ({
    activePresetId: 'default',
    activePreset: { id: 'default' },
    refreshKey: 1,
    applyPreset: jest.fn(),
  }),
}));

jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({
    objectPermissionsByObjectMetadataId: {
      'dashboard-object-id': {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: true,
        restrictedFields: {},
        objectMetadataId: 'dashboard-object-id',
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
    },
  }),
}));

jest.mock('@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu', () => ({
  useNavigatePageLayoutCommandMenu: () => ({
    navigatePageLayoutCommandMenu: jest.fn(),
  }),
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({
    isInRightDrawer: false,
    layoutType: 'show-page',
    targetRecordIdentifier: { id: 'dashboard-1' },
  }),
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => jest.fn(),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue', () => ({
  useAtomComponentStateValue: jest
    .fn()
    .mockReturnValueOnce(false)
    .mockReturnValueOnce('tab-1'),
}));

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => false,
}));

describe('PageLayoutRendererContent', () => {
  it('renders global filter bar for dashboard with enabled global filters', () => {
    render(<PageLayoutRendererContent />);

    expect(screen.getByTestId('global-filter-bar')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-widget-content')).toBeInTheDocument();
  });
});
