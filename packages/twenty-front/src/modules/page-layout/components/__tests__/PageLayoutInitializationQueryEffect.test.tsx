/* eslint-disable @nx/enforce-module-boundaries */
import { gql } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { PageLayoutInitializationQueryEffect } from '@/page-layout/components/PageLayoutInitializationQueryEffect';
import { render, waitFor } from '@testing-library/react';
import { createStore } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';

jest.mock('@/page-layout/hooks/useBasePageLayout', () => ({
  useBasePageLayout: jest.fn(),
}));

jest.mock('@/page-layout/hooks/usePageLayoutWithRelationWidgets', () => ({
  usePageLayoutWithRelationWidgets: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: jest.fn(),
}));

const { useBasePageLayout } = jest.requireMock(
  '@/page-layout/hooks/useBasePageLayout',
);
const { usePageLayoutWithRelationWidgets } = jest.requireMock(
  '@/page-layout/hooks/usePageLayoutWithRelationWidgets',
);
const { useObjectMetadataItems } = jest.requireMock(
  '@/object-metadata/hooks/useObjectMetadataItems',
);

const dashboardPresetId = 'df68d6fd-c61a-4ef4-b8d4-0c9b2d1b6357';

const dashboardPresetQueryMocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        query DashboardPreset($id: UUID!) {
          dashboardPreset(id: $id) {
            id
            name
            dashboardId
            filter
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        id: dashboardPresetId,
      },
    },
    result: {
      data: {
        dashboardPreset: {
          id: dashboardPresetId,
          name: 'Open deals',
          dashboardId: 'dashboard-id',
          filter: {
            recordFilters: [
              {
                fieldMetadataId: 'status-field-id',
                operand: ViewFilterOperand.IS,
                type: FieldMetadataType.SELECT,
                value: 'OPEN',
              },
            ],
            recordFilterGroups: [],
          },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  },
];

describe('PageLayoutInitializationQueryEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const pageLayout = {
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
    };

    useBasePageLayout.mockReturnValue(pageLayout);
    usePageLayoutWithRelationWidgets.mockReturnValue(pageLayout);
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
          readableFields: [],
        },
      ],
    });
  });

  it('should hydrate dashboard filters from query params when the page layout initializes', async () => {
    const store = createStore();

    render(
      <MockedProvider addTypename={false}>
        <MemoryRouter
          initialEntries={[
            '/dashboards/filter-propagation?filter[status][IS]=OPEN',
          ]}
        >
          <PageLayoutTestWrapper store={store}>
            <PageLayoutInitializationQueryEffect pageLayoutId="dashboard-id" />
          </PageLayoutTestWrapper>
        </MemoryRouter>
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(
        store.get(
          dashboardFiltersComponentState.atomFamily({
            instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          }),
        ),
      ).toEqual({
        recordFilters: [
          expect.objectContaining({
            fieldMetadataId: 'status-field-id',
            operand: ViewFilterOperand.IS,
            type: FieldMetadataType.SELECT,
            value: 'OPEN',
          }),
        ],
        recordFilterGroups: [],
      });
    });
  });

  it('should hydrate dashboard filters from a preset id in the URL when the page layout initializes', async () => {
    const store = createStore();

    render(
      <MockedProvider mocks={dashboardPresetQueryMocks} addTypename={false}>
        <MemoryRouter
          initialEntries={[
            `/dashboards/filter-propagation?preset=${dashboardPresetId}`,
          ]}
        >
          <PageLayoutTestWrapper store={store}>
            <PageLayoutInitializationQueryEffect pageLayoutId="dashboard-id" />
          </PageLayoutTestWrapper>
        </MemoryRouter>
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(
        store.get(
          dashboardFiltersComponentState.atomFamily({
            instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          }),
        ),
      ).toEqual({
        recordFilters: [
          expect.objectContaining({
            fieldMetadataId: 'status-field-id',
            operand: ViewFilterOperand.IS,
            type: FieldMetadataType.SELECT,
            value: 'OPEN',
          }),
        ],
        recordFilterGroups: [],
      });
    });
  });
});
