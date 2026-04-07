/* eslint-disable @nx/enforce-module-boundaries */
import { gql } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { useDashboardPresetsApi } from '@/page-layout/hooks/useDashboardPresetsApi';

const dashboardId = '6f7ca74a-f2ec-45bc-a0ec-9e118a90501d';
const presetId = 'df68d6fd-c61a-4ef4-b8d4-0c9b2d1b6357';

const filterState = {
  recordFilters: [
    {
      fieldMetadataId: 'status-field-id',
      operand: ViewFilterOperand.IS,
      type: FieldMetadataType.SELECT,
      value: 'OPEN',
    },
  ],
  recordFilterGroups: [],
};

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
          createDashboardPreset(input: $input) {
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
        input: {
          dashboardId,
          name: 'Open deals',
          filter: filterState,
        },
      },
    },
    result: jest.fn(() => ({
      data: {
        createDashboardPreset: {
          id: presetId,
          name: 'Open deals',
          dashboardId,
          filter: filterState,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    })),
  },
  {
    request: {
      query: gql`
        query DashboardPresets($dashboardId: UUID!) {
          dashboardPresets(dashboardId: $dashboardId) {
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
        dashboardId,
      },
    },
    result: jest.fn(() => ({
      data: {
        dashboardPresets: [
          {
            id: presetId,
            name: 'Open deals',
            dashboardId,
            filter: filterState,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    })),
  },
  {
    request: {
      query: gql`
        mutation UpdateDashboardPreset($input: UpdateDashboardPresetInput!) {
          updateDashboardPreset(input: $input) {
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
        input: {
          id: presetId,
          name: 'Won deals',
        },
      },
    },
    result: jest.fn(() => ({
      data: {
        updateDashboardPreset: {
          id: presetId,
          name: 'Won deals',
          dashboardId,
          filter: filterState,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      },
    })),
  },
  {
    request: {
      query: gql`
        mutation DeleteDashboardPreset($id: UUID!) {
          deleteDashboardPreset(id: $id)
        }
      `,
      variables: {
        id: presetId,
      },
    },
    result: jest.fn(() => ({
      data: {
        deleteDashboardPreset: true,
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe('useDashboardPresetsApi', () => {
  it('should execute preset CRUD operations through GraphQL', async () => {
    const { result } = renderHook(() => useDashboardPresetsApi(dashboardId), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const createdPreset = await result.current.createDashboardPreset(
        'Open deals',
        filterState,
      );

      expect(createdPreset).toMatchObject({
        id: presetId,
        name: 'Open deals',
        dashboardId,
        filterState,
      });
    });

    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
    });

    await act(async () => {
      const presets = await result.current.listDashboardPresets(dashboardId);

      expect(presets).toEqual([
        expect.objectContaining({
          id: presetId,
          name: 'Open deals',
          dashboardId,
          filterState,
        }),
      ]);
    });

    await waitFor(() => {
      expect(mocks[1].result).toHaveBeenCalled();
    });

    await act(async () => {
      const updatedPreset = await result.current.renameDashboardPreset(
        presetId,
        'Won deals',
      );

      expect(updatedPreset).toEqual({
        id: presetId,
        name: 'Won deals',
      });
    });

    await waitFor(() => {
      expect(mocks[2].result).toHaveBeenCalled();
    });

    await act(async () => {
      const deleted = await result.current.deleteDashboardPreset(presetId);

      expect(deleted).toBe(true);
    });

    await waitFor(() => {
      expect(mocks[3].result).toHaveBeenCalled();
    });
  });
});
