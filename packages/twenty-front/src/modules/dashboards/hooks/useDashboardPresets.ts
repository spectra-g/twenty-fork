import { type DashboardFilters } from '@/dashboards/states/dashboardFiltersState';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';

const DASHBOARD_FILTERS_AND_PRESETS = gql`
  query DashboardFiltersAndPresets($dashboardId: UUID!) {
    dashboardFiltersAndPresets(dashboardId: $dashboardId) {
      presets {
        id
        name
        canEdit
        filterState
        lastUsedAt
      }
    }
  }
`;

const RENAME_DASHBOARD_PRESET = gql`
  mutation RenameDashboardPreset($presetId: UUID!, $name: String!) {
    renameDashboardPreset(presetId: $presetId, name: $name) {
      success
      preset {
        id
        name
        canEdit
        filterState
        lastUsedAt
      }
    }
  }
`;

const DELETE_DASHBOARD_PRESET = gql`
  mutation DeleteDashboardPreset($presetId: UUID!) {
    deleteDashboardPreset(presetId: $presetId) {
      success
    }
  }
`;

export type DashboardPreset = {
  id: string;
  name: string;
  canEdit: boolean;
  filterState: Partial<DashboardFilters>;
  lastUsedAt?: string;
};

type DashboardFiltersAndPresetsQueryResult = {
  dashboardFiltersAndPresets: {
    presets: DashboardPreset[];
  };
};

type RenameDashboardPresetMutationResult = {
  renameDashboardPreset: {
    success: boolean;
    preset: DashboardPreset;
  };
};

type DeleteDashboardPresetMutationResult = {
  deleteDashboardPreset: {
    success: boolean;
  };
};

export const useDashboardPresets = (dashboardId?: string) => {
  const [presets, setPresets] = useState<DashboardPreset[]>([]);
  const { data, loading } = useQuery<DashboardFiltersAndPresetsQueryResult>(
    DASHBOARD_FILTERS_AND_PRESETS,
    {
      variables: {
        dashboardId,
      },
      skip: !dashboardId,
    },
  );
  const [renameDashboardPresetMutation] =
    useMutation<RenameDashboardPresetMutationResult>(RENAME_DASHBOARD_PRESET);
  const [deleteDashboardPresetMutation] =
    useMutation<DeleteDashboardPresetMutationResult>(DELETE_DASHBOARD_PRESET);

  useEffect(() => {
    setPresets(data?.dashboardFiltersAndPresets.presets ?? []);
  }, [data]);

  const renamePreset = async (presetId: string, name: string) => {
    const previousPresets = presets;

    setPresets((currentPresets) =>
      currentPresets.map((preset) =>
        preset.id === presetId ? { ...preset, name } : preset,
      ),
    );

    try {
      const response = await renameDashboardPresetMutation({
        variables: {
          presetId,
          name,
        },
      });
      const renamedPreset = response.data?.renameDashboardPreset.preset;

      if (!renamedPreset) {
        return;
      }

      setPresets((currentPresets) =>
        currentPresets.map((preset) =>
          preset.id === presetId ? renamedPreset : preset,
        ),
      );
    } catch (error) {
      setPresets(previousPresets);
      throw error;
    }
  };

  const deletePreset = async (presetId: string) => {
    const previousPresets = presets;

    setPresets((currentPresets) =>
      currentPresets.filter((preset) => preset.id !== presetId),
    );

    try {
      await deleteDashboardPresetMutation({
        variables: {
          presetId,
        },
      });
    } catch (error) {
      setPresets(previousPresets);
      throw error;
    }
  };

  return {
    presets,
    loading,
    renamePreset,
    deletePreset,
  };
};
