import { render, screen } from '@testing-library/react';

import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { PageLayoutType } from '~/generated-metadata/graphql';

jest.mock('@/page-layout/components/PageLayoutInitializationQueryEffect', () => ({
  PageLayoutInitializationQueryEffect: () => null,
}));

jest.mock('@/page-layout/components/PageLayoutRelationWidgetsSyncEffect', () => ({
  PageLayoutRelationWidgetsSyncEffect: () => null,
}));

jest.mock('@/page-layout/components/PageLayoutRendererContent', () => ({
  PageLayoutRendererContent: () => <div>page layout content</div>,
}));

jest.mock('@/page-layout/hooks/useSetIsPageLayoutInEditMode', () => ({
  useSetIsPageLayoutInEditMode: () => ({
    setIsPageLayoutInEditMode: jest.fn(),
  }),
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext');

describe('PageLayoutRenderer', () => {
  it('should render the dashboard filter bar for dashboard layouts', () => {
    (useLayoutRenderingContext as jest.Mock).mockReturnValue({
      targetRecordIdentifier: undefined,
      layoutType: PageLayoutType.DASHBOARD,
      isInRightDrawer: false,
    });

    render(<PageLayoutRenderer pageLayoutId="dashboard-layout-id" />);

    expect(screen.getByTestId('dashboard-filter-bar')).toBeVisible();
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

    expect(screen.queryByTestId('dashboard-filter-bar')).not.toBeInTheDocument();
  });
});
