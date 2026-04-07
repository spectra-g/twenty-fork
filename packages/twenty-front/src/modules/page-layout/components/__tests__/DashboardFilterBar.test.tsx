/* eslint-disable @nx/enforce-module-boundaries */
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { DashboardFilterBar } from '@/page-layout/components/DashboardFilterBar';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { THEME_LIGHT, ThemeProvider } from 'twenty-ui/theme';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: jest.fn(),
}));

jest.mock(
  '@/page-layout/hooks/useDashboardPresetsApi',
  () => ({
    useDashboardPresetsApi: jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  '~/hooks/useCopyToClipboard',
  () => ({
    useCopyToClipboard: jest.fn(),
  }),
  { virtual: true },
);

const { useObjectMetadataItems } = jest.requireMock(
  '@/object-metadata/hooks/useObjectMetadataItems',
);
const { useDashboardPresetsApi } = jest.requireMock(
  '@/page-layout/hooks/useDashboardPresetsApi',
);
const { useCopyToClipboard } = jest.requireMock('~/hooks/useCopyToClipboard');

const mockCreateDashboardPreset = jest.fn();
const mockRenameDashboardPreset = jest.fn();
const mockDeleteDashboardPreset = jest.fn();
const mockListDashboardPresets = jest.fn();
const mockCopyToClipboard = jest.fn();

const renderDashboardFilterBar = ({
  store,
}: {
  store?: ReturnType<typeof createStore>;
} = {}) => {
  return render(
    <ThemeProvider theme={THEME_LIGHT}>
      <PageLayoutTestWrapper store={store}>
        <DashboardFilterBar pageLayout={pageLayout} />
      </PageLayoutTestWrapper>
    </ThemeProvider>,
  );
};

const pageLayout = {
  id: 'dashboard-id',
  name: 'Dashboard',
  type: PageLayoutType.DASHBOARD,
  objectMetadataId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  tabs: [
    {
      id: 'tab-1',
      title: 'Main',
      position: 0,
      applicationId: 'app-id',
      pageLayoutId: 'dashboard-id',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      deletedAt: null,
      widgets: [
        {
          id: 'widget-1',
          title: 'Pipeline',
          type: WidgetType.GRAPH,
          objectMetadataId: 'person-id',
          pageLayoutTabId: 'tab-1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          deletedAt: null,
          gridPosition: {
            __typename: 'GridPosition',
            row: 0,
            column: 0,
            rowSpan: 2,
            columnSpan: 2,
          },
          configuration: {
            __typename: 'BarChartConfiguration',
            configurationType: WidgetConfigurationType.BAR_CHART,
          },
        },
      ],
    },
  ],
} as PageLayout;

describe('DashboardFilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useObjectMetadataItems.mockReturnValue({
      objectMetadataItems: [
        {
          id: 'person-id',
          fields: [
            {
              id: 'status-field-id',
              name: 'status',
              label: 'Status',
              type: FieldMetadataType.SELECT,
            },
          ],
          readableFields: [
            {
              id: 'status-field-id',
              name: 'status',
              label: 'Status',
              type: FieldMetadataType.SELECT,
              options: [
                {
                  id: 'open-option-id',
                  value: 'OPEN',
                  label: 'Open',
                  position: 0,
                  color: 'green',
                },
              ],
            },
          ],
        },
      ],
    });

    useDashboardPresetsApi.mockReturnValue({
      createDashboardPreset: mockCreateDashboardPreset.mockImplementation(
        async (name: string, filterState: unknown) => ({
          id: 'mock-created-preset-id',
          name,
          filterState,
          createdAt: '2024-01-02T00:00:00.000Z',
        }),
      ),
      renameDashboardPreset: mockRenameDashboardPreset.mockImplementation(
        async (id: string, name: string) => ({
          id,
          name,
        }),
      ),
      deleteDashboardPreset: mockDeleteDashboardPreset.mockResolvedValue(true),
      listDashboardPresets: mockListDashboardPresets.mockResolvedValue([]),
    });

    useCopyToClipboard.mockReturnValue({
      copyToClipboard: mockCopyToClipboard,
    });
  });

  it('should show an empty state, apply the dashboard filter, and clear it', async () => {
    const user = userEvent.setup();
    const store = createStore();

    renderDashboardFilterBar({ store });

    expect(screen.getByText('No filters applied')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Add filter' }));

    expect(screen.getByText('Status is Open')).toBeVisible();

    expect(
      store.get(
        dashboardFiltersComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toEqual({
      recordFilters: [
        {
          fieldMetadataId: 'status-field-id',
          id: 'dashboard-status-filter',
          operand: ViewFilterOperand.IS,
          type: FieldMetadataType.SELECT,
          value: 'OPEN',
        },
      ],
      recordFilterGroups: [],
    });

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByText('No filters applied')).toBeVisible();

    expect(
      store.get(
        dashboardFiltersComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toEqual({
      recordFilters: [],
      recordFilterGroups: [],
    });
  });

  it('should open the save preset dialog and save the current dashboard filters', async () => {
    const user = userEvent.setup();
    const store = createStore();

    renderDashboardFilterBar({ store });

    await user.click(screen.getByRole('button', { name: 'Add filter' }));
    await user.click(screen.getByRole('button', { name: 'Presets' }));
    await user.click(screen.getByRole('button', { name: 'Save preset' }));

    expect(screen.getByRole('heading', { name: 'Save preset' })).toBeVisible();

    await user.type(screen.getByLabelText('Preset name'), 'Open deals');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockCreateDashboardPreset).toHaveBeenCalledWith('Open deals', {
      recordFilters: [
        {
          fieldMetadataId: 'status-field-id',
          id: 'dashboard-status-filter',
          operand: ViewFilterOperand.IS,
          type: FieldMetadataType.SELECT,
          value: 'OPEN',
        },
      ],
      recordFilterGroups: [],
    });

    expect(
      screen.queryByRole('heading', { name: 'Save preset' }),
    ).not.toBeInTheDocument();
    expect(await screen.findByText('Open deals')).toBeVisible();
  });

  it('should render saved presets and support rename and delete actions', async () => {
    const user = userEvent.setup();

    mockListDashboardPresets.mockResolvedValue([
      {
        id: 'preset-1',
        name: 'Open deals',
        filterState: {
          recordFilters: [],
          recordFilterGroups: [],
        },
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'preset-2',
        name: 'Closed deals',
        filterState: {
          recordFilters: [],
          recordFilterGroups: [],
        },
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ]);

    renderDashboardFilterBar();

    await user.click(screen.getByRole('button', { name: 'Presets' }));

    expect(await screen.findByText('Open deals')).toBeVisible();
    expect(screen.getByText('Closed deals')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Rename Open deals' }));

    const renameInput = screen.getByLabelText('Preset name');
    await user.clear(renameInput);
    await user.type(renameInput, 'Open pipeline');
    await user.click(screen.getByRole('button', { name: 'Save rename' }));

    expect(mockRenameDashboardPreset).toHaveBeenCalledWith(
      'preset-1',
      'Open pipeline',
    );
    expect(await screen.findByText('Open pipeline')).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Delete Closed deals' }),
    );

    expect(mockDeleteDashboardPreset).toHaveBeenCalledWith('preset-2');
    expect(screen.queryByText('Closed deals')).not.toBeInTheDocument();
  });

  it('should copy a shareable dashboard URL with the encoded filter state', async () => {
    const user = userEvent.setup();
    const store = createStore();

    window.history.replaceState({}, '', '/dashboard?foo=bar');

    renderDashboardFilterBar({ store });

    await user.click(screen.getByRole('button', { name: 'Add filter' }));
    await user.click(screen.getByRole('button', { name: 'Share' }));

    expect(mockCopyToClipboard).toHaveBeenCalledTimes(1);

    const [shareableUrl] = mockCopyToClipboard.mock.calls[0];

    expect(shareableUrl).toContain('/dashboard?');
    expect(shareableUrl).toContain('foo=bar');
    expect(shareableUrl).toContain('filter%5Bstatus%5D%5BIS%5D=OPEN');
  });
});
