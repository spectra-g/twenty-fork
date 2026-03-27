import { t } from '@lingui/core/macro';
import { useId } from 'react';

import {
  useDashboardFilters,
  type DashboardStageFilter,
} from '@/dashboards/hooks/useDashboardFilters';
import {
  useDashboardPresets,
  type DashboardPreset,
} from '@/dashboards/hooks/useDashboardPresets';

export type DashboardStageFilterDefinition = {
  id: string;
  type: 'date' | 'owner' | 'stage';
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
};

type DashboardFilterBarProps = {
  filterDefinitions: DashboardStageFilterDefinition[];
  initialPresets?: DashboardPreset[];
  initialSelectedPresetId?: string;
  initialStageFilter?: DashboardStageFilter | null;
};

export const DashboardFilterBar = ({
  filterDefinitions,
  initialPresets,
  initialSelectedPresetId,
  initialStageFilter = null,
}: DashboardFilterBarProps) => {
  const stageFilterDefinition = filterDefinitions.find(
    (filterDefinition) => filterDefinition.type === 'stage',
  );
  const { activeStageFilter, clearActiveStageFilter, setActiveStageFilter } =
    useDashboardFilters(initialStageFilter);
  const {
    presets,
    renamePreset,
    savePreset,
    selectPreset,
    selectedPreset,
    selectedPresetId,
  } = useDashboardPresets({
    initialPresets,
    initialSelectedPresetId,
  });
  const stageFilterSelectId = useId();
  const presetNameInputId = useId();
  const renamePresetInputId = useId();

  const handleStageFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedValue = event.target.value;

    if (selectedValue === '') {
      clearActiveStageFilter();

      return;
    }

    const selectedOption = stageFilterDefinition?.options.find(
      (option) => option.value === selectedValue,
    );

    if (!selectedOption) {
      return;
    }

    const stageFilter: DashboardStageFilter = {
      value: selectedOption.value,
      label: selectedOption.label,
    };

    if (selectedPresetId !== '') {
      selectPreset('');
    }

    setActiveStageFilter(stageFilter);
  };

  const handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextPresetId = event.target.value;
    const preset = presets.find(
      (currentPreset) => currentPreset.id === nextPresetId,
    );

    selectPreset(nextPresetId);

    if (!preset) {
      clearActiveStageFilter();

      return;
    }

    setActiveStageFilter(preset.stageFilter);
  };

  const handleSavePreset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeStageFilter) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const presetName = formData.get('presetName');

    if (typeof presetName !== 'string' || presetName.trim() === '') {
      return;
    }

    savePreset({
      presetName,
      stageFilter: activeStageFilter,
    });

    event.currentTarget.reset();
  };

  const handleRenamePreset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPreset) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const presetName = formData.get('renamePresetName');

    if (typeof presetName !== 'string' || presetName.trim() === '') {
      return;
    }

    renamePreset({
      presetId: selectedPreset.id,
      presetName,
    });

    event.currentTarget.reset();
  };

  return (
    <div data-testid="dashboard-filter-bar">
      <label htmlFor={presetNameInputId}>{t`Preset picker`}</label>
      <select
        id={presetNameInputId}
        aria-label={t`Preset picker`}
        value={selectedPresetId}
        onChange={handlePresetChange}
      >
        <option value="">{t`No preset selected`}</option>
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>
      {stageFilterDefinition ? (
        <>
          <label htmlFor={stageFilterSelectId}>
            {stageFilterDefinition.label} filter
          </label>
          <select
            id={stageFilterSelectId}
            aria-label={`${stageFilterDefinition.label} filter`}
            value={activeStageFilter?.value ?? ''}
            onChange={handleStageFilterChange}
          >
            <option value="">Select {stageFilterDefinition.label}</option>
            {stageFilterDefinition.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      ) : null}
      <form onSubmit={handleSavePreset}>
        <label htmlFor={renamePresetInputId}>{t`Preset name`}</label>
        <input id={renamePresetInputId} name="presetName" type="text" />
        <button type="submit">{t`Confirm Save Preset`}</button>
      </form>
      <button type="button">{t`Save as Preset`}</button>
      <form onSubmit={handleRenamePreset}>
        <label
          htmlFor={`${renamePresetInputId}-rename`}
        >{t`Rename preset`}</label>
        <input
          id={`${renamePresetInputId}-rename`}
          name="renamePresetName"
          type="text"
        />
        <button type="submit">{t`Confirm Rename Preset`}</button>
      </form>
      {activeStageFilter ? (
        <button type="button" onClick={clearActiveStageFilter}>
          {stageFilterDefinition?.label} {activeStageFilter.label}
        </button>
      ) : null}
    </div>
  );
};
