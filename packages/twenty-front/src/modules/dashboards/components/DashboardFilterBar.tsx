import { useLingui } from '@lingui/react/macro';
import { DashboardUrlFiltersEffect } from '@/dashboards/components/DashboardUrlFiltersEffect';
import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { useDashboardPresets } from '@/dashboards/hooks/useDashboardPresets';
import { EMPTY_DASHBOARD_FILTERS } from '@/dashboards/states/dashboardFiltersState';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

type DashboardSelectOption = {
  label: string;
  value: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledPresetActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPresetNameInput = styled.input`
  min-width: 180px;
`;

type DashboardFilterBarProps = {
  dashboardId: string;
};

export const DashboardFilterBar = ({
  dashboardId,
}: DashboardFilterBarProps) => {
  const { t } = useLingui();
  const presetLabel = t`Preset`;
  const renamePresetLabel = t`Rename Preset`;
  const deletePresetLabel = t`Delete Preset`;
  const presetNameLabel = t`Preset name`;
  const savePresetNameLabel = t`Save Preset Name`;
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [presetNameDraft, setPresetNameDraft] = useState('');
  const [isRenameFormVisible, setIsRenameFormVisible] = useState(false);
  const { presets, loading, renamePreset, deletePreset } =
    useDashboardPresets(dashboardId);
  const { dashboardFilters, replaceDashboardFilters, setDashboardFilter } =
    useDashboardFilters(dashboardId);
  const selectedPreset =
    presets.find((preset) => preset.id === selectedPresetId) ?? null;

  useEffect(() => {
    if (
      selectedPresetId !== null &&
      !presets.some((preset) => preset.id === selectedPresetId)
    ) {
      setSelectedPresetId(null);
      setPresetNameDraft('');
      setIsRenameFormVisible(false);
    }
  }, [presets, selectedPresetId]);

  const ownerOptions: DashboardSelectOption[] = [
    {
      label: t`Sales Team`,
      value: 'sales-team',
    },
  ];

  const dateRangeOptions: DashboardSelectOption[] = [
    {
      label: t`Last 7 days`,
      value: 'last-7-days',
    },
    {
      label: t`Last 30 days`,
      value: 'last-30-days',
    },
  ];

  const stageOptions: DashboardSelectOption[] = [
    {
      label: t`Qualified`,
      value: 'qualified',
    },
  ];

  const presetOptions: DashboardSelectOption[] = presets.map((preset) => ({
    label: preset.name,
    value: preset.id,
  }));

  const handlePresetSelect = (value: string | null) => {
    setSelectedPresetId(value);
    setIsRenameFormVisible(false);

    if (!value) {
      setPresetNameDraft('');
      replaceDashboardFilters(EMPTY_DASHBOARD_FILTERS);

      return;
    }

    const preset = presets.find((currentPreset) => currentPreset.id === value);

    if (!preset) {
      return;
    }

    setPresetNameDraft(preset.name);
    replaceDashboardFilters({
      ...EMPTY_DASHBOARD_FILTERS,
      ...preset.filterState,
    });
  };

  const handleRenamePreset = async () => {
    if (!selectedPreset) {
      return;
    }

    try {
      await renamePreset(selectedPreset.id, presetNameDraft);
      setIsRenameFormVisible(false);
    } catch {
      console.groupCollapsed('Dashboard preset rename failed');
      console.groupEnd();
    }
  };

  const handleDeletePreset = async () => {
    if (!selectedPreset) {
      return;
    }

    try {
      await deletePreset(selectedPreset.id);
      setSelectedPresetId(null);
      setPresetNameDraft('');
      setIsRenameFormVisible(false);
      replaceDashboardFilters(EMPTY_DASHBOARD_FILTERS);
    } catch {
      console.groupCollapsed('Dashboard preset delete failed');
      console.groupEnd();
    }
  };

  return (
    <StyledContainer>
      <DashboardUrlFiltersEffect dashboardId={dashboardId} />
      <Select
        dropdownId={`dashboard-filter-preset-${dashboardId}`}
        label={presetLabel}
        options={presetOptions}
        value={selectedPresetId}
        disabled={loading}
        emptyOption={{
          label: presetLabel,
          value: null,
        }}
        onChange={handlePresetSelect}
      />
      {selectedPreset?.canEdit ? (
        <StyledPresetActions>
          <button
            type="button"
            onClick={() => {
              setPresetNameDraft(selectedPreset.name);
              setIsRenameFormVisible(true);
            }}
          >
            {renamePresetLabel}
          </button>
          <button type="button" onClick={handleDeletePreset}>
            {deletePresetLabel}
          </button>
          {isRenameFormVisible ? (
            <>
              <StyledPresetNameInput
                aria-label={presetNameLabel}
                value={presetNameDraft}
                onChange={(event) => setPresetNameDraft(event.target.value)}
              />
              <button type="button" onClick={handleRenamePreset}>
                {savePresetNameLabel}
              </button>
            </>
          ) : null}
        </StyledPresetActions>
      ) : null}
      <Select
        dropdownId={`dashboard-filter-owner-${dashboardId}`}
        label="Owner"
        options={ownerOptions}
        value={dashboardFilters.ownerId}
        disabled={loading}
        emptyOption={{
          label: 'Owner',
          value: null,
        }}
        onChange={(value) => setDashboardFilter('ownerId', value)}
      />
      <Select
        dropdownId={`dashboard-filter-date-range-${dashboardId}`}
        label="Date Range"
        options={dateRangeOptions}
        value={dashboardFilters.dateRange}
        disabled={loading}
        emptyOption={{
          label: 'Date Range',
          value: null,
        }}
        onChange={(value) => setDashboardFilter('dateRange', value)}
      />
      <Select
        dropdownId={`dashboard-filter-stage-${dashboardId}`}
        label="Stage"
        options={stageOptions}
        value={dashboardFilters.stageId}
        disabled={loading}
        emptyOption={{
          label: 'Stage',
          value: null,
        }}
        onChange={(value) => setDashboardFilter('stageId', value)}
      />
    </StyledContainer>
  );
};
