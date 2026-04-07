import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { DashboardFilterBar } from '@/page-layout/components/DashboardFilterBar';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { PageLayoutType, WidgetConfigurationType, WidgetType } from '~/generated-metadata/graphql';

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

describe('DashboardFilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useObjectMetadataItems.mockReturnValue({
      objectMetadataItems: [
        {
          id: 'person-id',
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

  it('should show an empty state, apply the dashboard filter, and clear it', async () => {
    const user = userEvent.setup();
    const store = createStore();

    render(
      <PageLayoutTestWrapper store={store}>
        <DashboardFilterBar
          pageLayout={{
            id: 'dashboard-id',
            name: 'Dashboard',
            type: PageLayoutType.DASHBOARD,
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
          }}
        />
      </PageLayoutTestWrapper>,
    );

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
});
