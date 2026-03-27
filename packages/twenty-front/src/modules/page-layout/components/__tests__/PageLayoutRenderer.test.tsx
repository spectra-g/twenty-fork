import { render, screen } from '@testing-library/react';

import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { useBasePageLayout } from '@/page-layout/hooks/useBasePageLayout';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { PageLayoutType } from '~/generated-metadata/graphql';

jest.mock(
  '@/page-layout/components/PageLayoutInitializationQueryEffect',
  () => ({
    PageLayoutInitializationQueryEffect: () => null,
  }),
);

jest.mock(
  '@/page-layout/components/PageLayoutRelationWidgetsSyncEffect',
  () => ({
    PageLayoutRelationWidgetsSyncEffect: () => null,
  }),
);

jest.mock('@/page-layout/components/PageLayoutRendererContent', () => ({
  PageLayoutRendererContent: () => <div>page layout content</div>,
}));

jest.mock('@/page-layout/hooks/useSetIsPageLayoutInEditMode', () => ({
  useSetIsPageLayoutInEditMode: () => ({
    setIsPageLayoutInEditMode: jest.fn(),
  }),
}));

jest.mock('@/page-layout/hooks/useBasePageLayout');
jest.mock('@/ui/layout/contexts/LayoutRenderingContext');

describe('PageLayoutRenderer', () => {
  beforeEach(() => {
    (useBasePageLayout as jest.Mock).mockReturnValue(undefined);
  });

  it('should render the dashboard filter bar for dashboard layouts', () => {
    (useLayoutRenderingContext as jest.Mock).mockReturnValue({
      targetRecordIdentifier: undefined,
      layoutType: PageLayoutType.DASHBOARD,
      isInRightDrawer: false,
    });
    (useBasePageLayout as jest.Mock).mockReturnValue({
      id: 'dashboard-layout-id',
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [],
      dashboardFilters: [{ id: 'stage-filter' }],
    });

    render(<PageLayoutRenderer pageLayoutId="dashboard-layout-id" />);

    expect(screen.getByTestId('dashboard-filter-bar')).toBeVisible();
  });

  it('should restore a preset from the dashboard URL when presetId is present', () => {
    window.history.replaceState(
      {},
      '',
      '/dashboard-layout?presetId=sales-stage-preset-123',
    );

    (useLayoutRenderingContext as jest.Mock).mockReturnValue({
      targetRecordIdentifier: undefined,
      layoutType: PageLayoutType.DASHBOARD,
      isInRightDrawer: false,
    });
    (useBasePageLayout as jest.Mock).mockReturnValue({
      id: 'dashboard-layout-id',
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [],
      dashboardFilters: [{ id: 'stage-filter' }],
    });

    render(<PageLayoutRenderer pageLayoutId="dashboard-layout-id" />);

    expect(screen.getByRole('combobox', { name: 'Preset picker' })).toHaveValue(
      'sales-stage-preset-123',
    );
    expect(
      screen.getByRole('button', { name: 'Stage Closed Won' }),
    ).toBeVisible();
  });

  it('should restore raw stage filters from the dashboard URL when no presetId is present', () => {
    window.history.replaceState(
      {},
      '',
      '/dashboard-layout?filter[stage][eq]=Open',
    );

    (useLayoutRenderingContext as jest.Mock).mockReturnValue({
      targetRecordIdentifier: undefined,
      layoutType: PageLayoutType.DASHBOARD,
      isInRightDrawer: false,
    });
    (useBasePageLayout as jest.Mock).mockReturnValue({
      id: 'dashboard-layout-id',
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [],
      dashboardFilters: [{ id: 'stage-filter' }],
    });

    render(<PageLayoutRenderer pageLayoutId="dashboard-layout-id" />);

    expect(screen.getByRole('combobox', { name: 'Preset picker' })).toHaveValue(
      '',
    );
    expect(screen.getByRole('combobox', { name: 'Stage filter' })).toHaveValue(
      'open',
    );
    expect(screen.getByRole('button', { name: 'Stage Open' })).toBeVisible();
  });

  it('should not render the dashboard filter bar for record page layouts', () => {
    (useLayoutRenderingContext as jest.Mock).mockReturnValue({
      targetRecordIdentifier: {
        id: 'record-id',
        targetObjectNameSingular: 'person',
      },
      layoutType: PageLayoutType.RECORD_PAGE,
      isInRightDrawer: false,
    });

    render(<PageLayoutRenderer pageLayoutId="record-layout-id" />);

    expect(
      screen.queryByTestId('dashboard-filter-bar'),
    ).not.toBeInTheDocument();
  });

  it('should not render the dashboard filter bar when dashboard filter metadata is missing', () => {
    (useLayoutRenderingContext as jest.Mock).mockReturnValue({
      targetRecordIdentifier: undefined,
      layoutType: PageLayoutType.DASHBOARD,
      isInRightDrawer: false,
    });
    (useBasePageLayout as jest.Mock).mockReturnValue({
      id: 'dashboard-layout-id',
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [],
      dashboardFilters: undefined,
    });

    render(<PageLayoutRenderer pageLayoutId="dashboard-layout-id" />);

    expect(
      screen.queryByTestId('dashboard-filter-bar'),
    ).not.toBeInTheDocument();
  });
});
