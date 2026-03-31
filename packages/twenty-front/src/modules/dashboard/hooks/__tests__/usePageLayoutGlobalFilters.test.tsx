import { usePageLayoutGlobalFilters } from '@/dashboard/hooks/usePageLayoutGlobalFilters';
import { dashboardGlobalFiltersState } from '@/dashboard/states/dashboardGlobalFiltersState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { useQuery } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const pageLayoutId = 'page-layout-id';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
}));

const mockedUseQuery = jest.mocked(useQuery);

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
    mockedUseQuery.mockReturnValue({
      data: {
        getPageLayout: {
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
});
