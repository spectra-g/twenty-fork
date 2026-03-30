import { PageLayoutMainContent } from '@/page-layout/PageLayoutMainContent';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { render, screen } from '@testing-library/react';

jest.mock('@/dashboards/components/DashboardFilterBar', () => ({
  DashboardFilterBar: ({ dashboardId }: { dashboardId: string }) => (
    <div>dashboard-filter-bar:{dashboardId}</div>
  ),
}));
jest.mock('@/page-layout/components/PageLayoutContent', () => ({
  PageLayoutContent: () => <div>page-layout-content</div>,
}));
jest.mock('@/page-layout/hooks/useCurrentPageLayoutOrThrow');
jest.mock('@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow');
jest.mock('@/page-layout/utils/getTabLayoutMode', () => ({
  getTabLayoutMode: () => 'GRID',
}));
jest.mock('@/ui/layout/contexts/LayoutRenderingContext');

const mockedUseCurrentPageLayoutOrThrow =
  useCurrentPageLayoutOrThrow as jest.Mock;
const mockedUsePageLayoutTabWithVisibleWidgetsOrThrow =
  usePageLayoutTabWithVisibleWidgetsOrThrow as jest.Mock;
const mockedUseLayoutRenderingContext = useLayoutRenderingContext as jest.Mock;

describe('PageLayoutMainContent', () => {
  beforeEach(() => {
    mockedUseCurrentPageLayoutOrThrow.mockReturnValue({
      currentPageLayout: {
        type: 'DASHBOARD',
      },
    });
    mockedUsePageLayoutTabWithVisibleWidgetsOrThrow.mockReturnValue({
      id: 'tab-1',
    });
  });

  it('should render the dashboard filter bar for dashboard layouts', () => {
    mockedUseLayoutRenderingContext.mockReturnValue({
      layoutType: 'DASHBOARD',
      targetRecordIdentifier: {
        id: 'dashboard-a',
      },
    });

    render(<PageLayoutMainContent tabId="tab-1" />);

    expect(screen.getByText('dashboard-filter-bar:dashboard-a')).toBeVisible();
    expect(screen.getByText('page-layout-content')).toBeVisible();
  });

  it('should not render the dashboard filter bar for record page layouts', () => {
    mockedUseCurrentPageLayoutOrThrow.mockReturnValue({
      currentPageLayout: {
        type: 'RECORD_PAGE',
      },
    });
    mockedUseLayoutRenderingContext.mockReturnValue({
      layoutType: 'RECORD_PAGE',
      targetRecordIdentifier: {
        id: 'company-a',
      },
    });

    render(<PageLayoutMainContent tabId="tab-1" />);

    expect(
      screen.queryByText('dashboard-filter-bar:company-a'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('page-layout-content')).toBeVisible();
  });
});
