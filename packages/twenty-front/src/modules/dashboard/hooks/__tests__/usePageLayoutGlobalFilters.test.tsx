import { usePageLayoutGlobalFilters } from '@/dashboard/hooks/usePageLayoutGlobalFilters';
import { dashboardGlobalFiltersState } from '@/dashboard/states/dashboardGlobalFiltersState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { useUpdatePageLayoutWithTabsAndWidgets } from '@/page-layout/hooks/useUpdatePageLayoutWithTabsAndWidgets';
import { useQuery } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const pageLayoutId = 'page-layout-id';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
}));

jest.mock('@/page-layout/hooks/useUpdatePageLayoutWithTabsAndWidgets', () => ({
  useUpdatePageLayoutWithTabsAndWidgets: jest.fn(),
}));

const mockedUseQuery = jest.mocked(useQuery);
const mockedUseUpdatePageLayoutWithTabsAndWidgets = jest.mocked(
  useUpdatePageLayoutWithTabsAndWidgets,
);
const updatePageLayoutWithTabsAndWidgets = jest.fn();

const getWrapper = () => {
  const store = createStore();

  store.set(currentPageLayoutIdState.atom, pageLayoutId);
  store.set(dashboardGlobalFiltersState, []);

  return ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );
};

describe('usePageLayoutGlobalFilters', () => {
  beforeEach(() => {
    updatePageLayoutWithTabsAndWidgets.mockResolvedValue({
      status: 'successful',
    });
    mockedUseUpdatePageLayoutWithTabsAndWidgets.mockReturnValue({
      updatePageLayoutWithTabsAndWidgets,
    } as never);
    mockedUseQuery.mockReturnValue({
      data: {
        getPageLayout: {
          id: pageLayoutId,
          name: 'Dashboard',
          type: 'DASHBOARD',
          objectMetadataId: null,
          recordFilters: [
            {
              id: 'filter-1',
              fieldMetadataId: 'status',
              label: 'Status',
              value: 'active',
              displayValue: 'Active',
              type: 'SELECT',
              operand: 'is',
            },
            {
              id: 'filter-2',
              fieldMetadataId: 'owner',
              label: 'Owner',
              value: 'assigned',
              displayValue: 'Assigned to me',
              type: 'TEXT',
              operand: 'contains',
            },
          ],
          recordFilterGroups: [],
          tabs: [
            {
              id: 'tab-1',
              title: 'Tab 1',
              position: 0,
              widgets: [],
            },
          ],
        },
      },
    } as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('hydrates available and active filters from the current page layout query', async () => {
    const { result } = renderHook(() => usePageLayoutGlobalFilters(), {
      wrapper: getWrapper(),
    });

    await waitFor(() => {
      expect(result.current.availableFilters).toEqual([
        {
          field: 'status',
          label: 'Status',
          options: [{ value: 'active', label: 'Active' }],
        },
        {
          field: 'owner',
          label: 'Owner',
          options: [{ value: 'assigned', label: 'Assigned to me' }],
        },
      ]);
    });

    expect(result.current.activeFilters).toEqual([
      {
        field: 'status',
        label: 'Status',
        value: 'active',
      },
      {
        field: 'owner',
        label: 'Owner',
        value: 'assigned',
      },
    ]);
    expect(result.current.chartDataFilter).toEqual({
      recordFilters: [
        {
          id: 'filter-1',
          fieldMetadataId: 'status',
          operand: 'is',
          value: 'active',
          type: 'SELECT',
          recordFilterGroupId: undefined,
          subFieldName: undefined,
        },
        {
          id: 'filter-2',
          fieldMetadataId: 'owner',
          operand: 'contains',
          value: 'assigned',
          type: 'TEXT',
          recordFilterGroupId: undefined,
          subFieldName: undefined,
        },
      ],
      recordFilterGroups: [],
    });
  });

  it('persists filter updates to the page layout mutation when setting, removing, and clearing filters', async () => {
    const { result } = renderHook(() => usePageLayoutGlobalFilters(), {
      wrapper: getWrapper(),
    });

    await waitFor(() => {
      expect(result.current.activeFilters).toHaveLength(2);
    });

    await act(async () => {
      result.current.setFilterValue('status', 'active');
    });

    await act(async () => {
      result.current.removeFilterValue('owner');
    });

    await act(async () => {
      result.current.clearFilters();
    });

    expect(updatePageLayoutWithTabsAndWidgets).toHaveBeenNthCalledWith(
      1,
      pageLayoutId,
      expect.objectContaining({
        name: 'Dashboard',
        type: 'DASHBOARD',
        objectMetadataId: null,
        recordFilters: [
          expect.objectContaining({
            id: 'filter-2',
            fieldMetadataId: 'owner',
            value: 'assigned',
          }),
          expect.objectContaining({
            id: 'filter-1',
            fieldMetadataId: 'status',
            value: 'active',
          }),
        ],
        recordFilterGroups: [],
        tabs: [
          expect.objectContaining({
            id: 'tab-1',
            title: 'Tab 1',
            widgets: [],
          }),
        ],
      }),
    );

    expect(updatePageLayoutWithTabsAndWidgets).toHaveBeenNthCalledWith(
      2,
      pageLayoutId,
      expect.objectContaining({
        recordFilters: [
          expect.objectContaining({
            id: 'filter-1',
            fieldMetadataId: 'status',
            value: 'active',
          }),
        ],
        recordFilterGroups: [],
      }),
    );

    expect(updatePageLayoutWithTabsAndWidgets).toHaveBeenNthCalledWith(
      3,
      pageLayoutId,
      expect.objectContaining({
        recordFilters: [],
        recordFilterGroups: [],
      }),
    );
  });
});
