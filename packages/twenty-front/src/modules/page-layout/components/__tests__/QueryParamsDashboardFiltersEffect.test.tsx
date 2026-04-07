/* eslint-disable @nx/enforce-module-boundaries */
import { activeDashboardPresetComponentState } from '@/page-layout/states/activeDashboardPresetComponentState';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { QueryParamsDashboardFiltersEffect } from '@/page-layout/components/QueryParamsDashboardFiltersEffect';
import { act, render, screen, waitFor } from '@testing-library/react';
import { createStore } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: jest.fn(),
}));

const { useObjectMetadataItems } = jest.requireMock(
  '@/object-metadata/hooks/useObjectMetadataItems',
);

const DashboardLocationProbe = () => {
  const location = useLocation();

  return <span data-testid="location-search">{location.search}</span>;
};

describe('QueryParamsDashboardFiltersEffect', () => {
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
  });

  it('should sync active dashboard filters to the URL and preserve unrelated query params', async () => {
    const store = createStore();

    render(
      <MemoryRouter
        initialEntries={['/dashboards/filter-propagation?view=board']}
      >
        <PageLayoutTestWrapper store={store}>
          <QueryParamsDashboardFiltersEffect
            pageLayout={{
              id: 'dashboard-id',
              name: 'Dashboard',
              type: 'DASHBOARD',
              objectMetadataId: null,
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
                      type: 'GRAPH',
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
                        configurationType: 'BAR_CHART',
                      },
                    },
                  ],
                },
              ],
            }}
          />
          <DashboardLocationProbe />
        </PageLayoutTestWrapper>
      </MemoryRouter>,
    );

    act(() => {
      store.set(
        dashboardFiltersComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        {
          recordFilters: [
            {
              id: 'dashboard-status-filter',
              fieldMetadataId: 'status-field-id',
              operand: ViewFilterOperand.IS,
              type: FieldMetadataType.SELECT,
              value: 'OPEN',
            },
          ],
          recordFilterGroups: [],
        },
      );
    });

    await waitFor(() => {
      const search = screen.getByTestId('location-search').textContent ?? '';

      expect(search).toContain('view=board');
      expect(search).toContain('filter%5Bstatus%5D%5BIS%5D=OPEN');
    });
  });

  it('should remove dashboard filter query params when filters are cleared', async () => {
    const store = createStore();

    render(
      <MemoryRouter
        initialEntries={[
          '/dashboards/filter-propagation?view=board&filter%5Bstatus%5D%5BIS%5D=OPEN',
        ]}
      >
        <PageLayoutTestWrapper store={store}>
          <QueryParamsDashboardFiltersEffect
            pageLayout={{
              id: 'dashboard-id',
              name: 'Dashboard',
              type: 'DASHBOARD',
              objectMetadataId: null,
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
                      type: 'GRAPH',
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
                        configurationType: 'BAR_CHART',
                      },
                    },
                  ],
                },
              ],
            }}
          />
          <DashboardLocationProbe />
        </PageLayoutTestWrapper>
      </MemoryRouter>,
    );

    act(() => {
      store.set(
        dashboardFiltersComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        {
          recordFilters: [],
          recordFilterGroups: [],
        },
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toHaveTextContent(
        '?view=board',
      );
    });
  });

  it('should keep the preset param while filters match the active preset and switch to raw filter params after changes', async () => {
    const store = createStore();

    render(
      <MemoryRouter
        initialEntries={[
          '/dashboards/filter-propagation?view=board&preset=df68d6fd-c61a-4ef4-b8d4-0c9b2d1b6357',
        ]}
      >
        <PageLayoutTestWrapper store={store}>
          <QueryParamsDashboardFiltersEffect
            pageLayout={{
              id: 'dashboard-id',
              name: 'Dashboard',
              type: 'DASHBOARD',
              objectMetadataId: null,
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
                      type: 'GRAPH',
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
                        configurationType: 'BAR_CHART',
                      },
                    },
                  ],
                },
              ],
            }}
          />
          <DashboardLocationProbe />
        </PageLayoutTestWrapper>
      </MemoryRouter>,
    );

    act(() => {
      store.set(
        activeDashboardPresetComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        {
          id: 'df68d6fd-c61a-4ef4-b8d4-0c9b2d1b6357',
          name: 'Open deals',
          filterState: {
            recordFilters: [
              {
                id: 'dashboard-status-filter',
                fieldMetadataId: 'status-field-id',
                operand: ViewFilterOperand.IS,
                type: FieldMetadataType.SELECT,
                value: 'OPEN',
              },
            ],
            recordFilterGroups: [],
          },
        },
      );
      store.set(
        dashboardFiltersComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        {
          recordFilters: [
            {
              id: 'dashboard-status-filter',
              fieldMetadataId: 'status-field-id',
              operand: ViewFilterOperand.IS,
              type: FieldMetadataType.SELECT,
              value: 'OPEN',
            },
          ],
          recordFilterGroups: [],
        },
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toHaveTextContent(
        '?view=board&preset=df68d6fd-c61a-4ef4-b8d4-0c9b2d1b6357',
      );
    });

    act(() => {
      store.set(
        dashboardFiltersComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        {
          recordFilters: [
            {
              id: 'dashboard-status-filter',
              fieldMetadataId: 'status-field-id',
              operand: ViewFilterOperand.IS,
              type: FieldMetadataType.SELECT,
              value: 'CLOSED',
            },
          ],
          recordFilterGroups: [],
        },
      );
    });

    await waitFor(() => {
      const search = screen.getByTestId('location-search').textContent ?? '';

      expect(search).toContain('view=board');
      expect(search).toContain('filter%5Bstatus%5D%5BIS%5D=CLOSED');
      expect(search).not.toContain('preset=');
    });

    expect(
      store.get(
        activeDashboardPresetComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toBeNull();
  });
});
