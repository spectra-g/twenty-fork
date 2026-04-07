/* eslint-disable @nx/enforce-module-boundaries */
import { gql, useApolloClient } from '@apollo/client';
import { type ChartFilter } from 'twenty-shared/types';

export type DashboardPreset = {
  id: string;
  name: string;
  dashboardId: string;
  filterState: ChartFilter;
  createdAt: string;
  updatedAt: string;
};

type DashboardPresetGraphqlRecord = {
  id: string;
  name: string;
  dashboardId: string;
  filter: ChartFilter;
  createdAt: string;
  updatedAt: string;
};

const CREATE_DASHBOARD_PRESET = gql`
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
`;

const UPDATE_DASHBOARD_PRESET = gql`
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
`;

const DELETE_DASHBOARD_PRESET = gql`
  mutation DeleteDashboardPreset($id: UUID!) {
    deleteDashboardPreset(id: $id)
  }
`;

const LIST_DASHBOARD_PRESETS = gql`
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
`;

const GET_DASHBOARD_PRESET = gql`
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
`;

const mapDashboardPreset = (
  preset: DashboardPresetGraphqlRecord,
): DashboardPreset => ({
  id: preset.id,
  name: preset.name,
  dashboardId: preset.dashboardId,
  filterState: preset.filter,
  createdAt: preset.createdAt,
  updatedAt: preset.updatedAt,
});

export const useDashboardPresetsApi = (dashboardId?: string) => {
  const apolloClient = useApolloClient();

  const createDashboardPreset = async (
    name: string,
    filterState: ChartFilter,
  ): Promise<DashboardPreset> => {
    if (dashboardId === undefined) {
      throw new Error('dashboardId is required to create a dashboard preset');
    }

    const { data } = await apolloClient.mutate<{
      createDashboardPreset: DashboardPresetGraphqlRecord;
    }>({
      mutation: CREATE_DASHBOARD_PRESET,
      variables: {
        input: {
          dashboardId,
          name,
          filter: filterState,
        },
      },
    });

    if (data?.createDashboardPreset === undefined) {
      throw new Error('Failed to create dashboard preset');
    }

    return mapDashboardPreset(data.createDashboardPreset);
  };

  const renameDashboardPreset = async (id: string, name: string) => {
    const { data } = await apolloClient.mutate<{
      updateDashboardPreset: DashboardPresetGraphqlRecord;
    }>({
      mutation: UPDATE_DASHBOARD_PRESET,
      variables: {
        input: {
          id,
          name,
        },
      },
    });

    if (data?.updateDashboardPreset === undefined) {
      throw new Error('Failed to rename dashboard preset');
    }

    return {
      id: data.updateDashboardPreset.id,
      name: data.updateDashboardPreset.name,
    };
  };

  const deleteDashboardPreset = async (id: string) => {
    const { data } = await apolloClient.mutate<{
      deleteDashboardPreset: boolean;
    }>({
      mutation: DELETE_DASHBOARD_PRESET,
      variables: {
        id,
      },
    });

    return data?.deleteDashboardPreset ?? false;
  };

  const listDashboardPresets = async (requestedDashboardId: string) => {
    const { data } = await apolloClient.query<{
      dashboardPresets: DashboardPresetGraphqlRecord[];
    }>({
      query: LIST_DASHBOARD_PRESETS,
      variables: {
        dashboardId: requestedDashboardId,
      },
      fetchPolicy: 'no-cache',
    });

    return (data?.dashboardPresets ?? []).map(mapDashboardPreset);
  };

  const getDashboardPreset = async (id: string) => {
    const { data } = await apolloClient.query<{
      dashboardPreset: DashboardPresetGraphqlRecord;
    }>({
      query: GET_DASHBOARD_PRESET,
      variables: {
        id,
      },
      fetchPolicy: 'no-cache',
    });

    if (data?.dashboardPreset === undefined) {
      throw new Error('Failed to fetch dashboard preset');
    }

    return mapDashboardPreset(data.dashboardPreset);
  };

  return {
    createDashboardPreset,
    getDashboardPreset,
    renameDashboardPreset,
    deleteDashboardPreset,
    listDashboardPresets,
  };
};
