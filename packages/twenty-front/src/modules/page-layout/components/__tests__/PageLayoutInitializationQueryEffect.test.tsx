/* eslint-disable @nx/enforce-module-boundaries */
import { gql } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { activeDashboardPresetComponentState } from '@/page-layout/states/activeDashboardPresetComponentState';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { dashboardUrlErrorComponentState } from '@/page-layout/states/dashboardUrlErrorComponentState';
import { DashboardFilterBar } from '@/page-layout/components/DashboardFilterBar';
import { PageLayoutInitializationQueryEffect } from '@/page-layout/components/PageLayoutInitializationQueryEffect';
import { render, screen, waitFor } from '@testing-library/react';
import { createStore } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { THEME_LIGHT, ThemeProvider } from 'twenty-ui/theme';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import qs from 'qs';

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

jest.mock('@/page-layout/hooks/useCanManageDashboardPresets', () => ({
  useCanManageDashboardPresets: jest.fn(),
}));

jest.mock('@/page-layout/hooks/useDashboardPresets', () => ({
  useDashboardPresets: jest.fn(),
}));

jest.mock('@/page-layout/hooks/useDashboardShareableUrl', () => ({
  useDashboardShareableUrl: jest.fn(),
}));

jest.mock(
  '~/hooks/useCopyToClipboard',
  () => ({
    useCopyToClipboard: jest.fn(),
  }),
  { virtual: true },
);

const { useBasePageLayout } = jest.requireMock(
  '@/page-layout/hooks/useBasePageLayout',
);
const { usePageLayoutWithRelationWidgets } = jest.requireMock(
  '@/page-layout/hooks/usePageLayoutWithRelationWidgets',
);
const { useObjectMetadataItems } = jest.requireMock(
  '@/object-metadata/hooks/useObjectMetadataItems',
);
const { useCanManageDashboardPresets } = jest.requireMock(
  '@/page-layout/hooks/useCanManageDashboardPresets',
);
const { useDashboardPresets } = jest.requireMock(
  '@/page-layout/hooks/useDashboardPresets',
);
const { useDashboardShareableUrl } = jest.requireMock(
  '@/page-layout/hooks/useDashboardShareableUrl',
);
const { useCopyToClipboard } = jest.requireMock('~/hooks/useCopyToClipboard');

const dashboardPresetId = 'df68d6fd-c61a-4ef4-b8d4-0c9b2d1b6357';
const deletedDashboardPresetId = '00000000-0000-0000-0000-000000000404';

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
        id: deletedDashboardPresetId,
      },
    },
    result: {
      data: {
        dashboardPreset: null,
      },
    },
  },
];

const renderInitializationEffect = ({
  initialEntry,
  store,
  mocks = dashboardPresetQueryMocks,
  withFilterBar = false,
}: {
  initialEntry: string;
  store?: ReturnType<typeof createStore>;
  mocks?: MockedResponse[];
  withFilterBar?: boolean;
}) => {
  const currentStore = store ?? createStore();

  render(
    <ThemeProvider theme={THEME_LIGHT}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <PageLayoutTestWrapper store={currentStore}>
            <PageLayoutInitializationQueryEffect pageLayoutId="dashboard-id" />
            {withFilterBar && <DashboardFilterBar pageLayout={pageLayout} />}
          </PageLayoutTestWrapper>
        </MemoryRouter>
      </MockedProvider>
    </ThemeProvider>,
  );

  return currentStore;
};

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

describe('PageLayoutInitializationQueryEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();

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

    useCopyToClipboard.mockReturnValue({
      copyToClipboard: jest.fn(),
    });
    useCanManageDashboardPresets.mockReturnValue({
      canManageDashboardPresets: true,
    });
    useDashboardPresets.mockReturnValue({
      presets: [],
      savePreset: jest.fn(),
      renamePreset: jest.fn(),
      removePreset: jest.fn(),
    });
    useDashboardShareableUrl.mockReturnValue({
      getDashboardShareableUrl: jest.fn(() => 'https://example.com/dashboard'),
    });
  });

  it('should hydrate dashboard filters from query params when the page layout initializes', async () => {
    const store = renderInitializationEffect({
      initialEntry: '/dashboards/filter-propagation?filter[status][IS]=OPEN',
      mocks: [],
    });

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
    const store = renderInitializationEffect({
      initialEntry: `/dashboards/filter-propagation?preset=${dashboardPresetId}`,
    });

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

  it('should clear filters and expose a user-facing error when the preset in the URL no longer exists', async () => {
    const store = renderInitializationEffect({
      initialEntry: `/dashboards/filter-propagation?preset=${deletedDashboardPresetId}`,
      withFilterBar: true,
    });

    await waitFor(() => {
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

    expect(
      store.get(
        activeDashboardPresetComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toBeNull();

    expect(
      store.get(
        dashboardUrlErrorComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toEqual({
      message:
        'This preset is no longer available. The dashboard loaded without it.',
    });

    expect(
      await screen.findByText(
        'This preset is no longer available. The dashboard loaded without it.',
      ),
    ).toBeVisible();
    expect(screen.getByText('No filters applied')).toBeVisible();
  });

  it('should silently clear incompatible filter query params without blocking the dashboard', async () => {
    const store = renderInitializationEffect({
      initialEntry: '/dashboards/filter-propagation?filter[status]=OPEN',
      mocks: [],
      withFilterBar: true,
    });

    await waitFor(() => {
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

    expect(
      store.get(
        dashboardUrlErrorComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toBeNull();
    expect(screen.getByText('No filters applied')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should apply filters when the URL declares an unsupported filter version', async () => {
    const store = renderInitializationEffect({
      initialEntry:
        '/dashboards/filter-propagation?filterVersion=999&filter[status][IS]=OPEN',
      mocks: [],
      withFilterBar: true,
    });

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

    expect(screen.getByText('Status is Open')).toBeVisible();
    expect(
      store.get(
        dashboardUrlErrorComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toBeNull();
  });

  it('should expose a dismissible error when parsing the URL query params throws', async () => {
    const parseSpy = jest.spyOn(qs, 'parse').mockImplementationOnce(() => {
      throw new URIError('URI malformed');
    });

    const store = renderInitializationEffect({
      initialEntry: '/dashboards/filter-propagation?filter=%E0%A4%A',
      mocks: [],
      withFilterBar: true,
    });

    await waitFor(() => {
      expect(
        store.get(
          dashboardUrlErrorComponentState.atomFamily({
            instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          }),
        ),
      ).toEqual({
        message:
          'This dashboard link contains invalid filter parameters. The dashboard loaded without them.',
      });
    });

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
    expect(
      await screen.findByText(
        'This dashboard link contains invalid filter parameters. The dashboard loaded without them.',
      ),
    ).toBeVisible();

    parseSpy.mockRestore();
  });
});
