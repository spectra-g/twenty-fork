import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { DateRangeFilter } from '@/dashboard-filters/components/DateRangeFilter';
import { OwnerFilter } from '@/dashboard-filters/components/OwnerFilter';
import { StageFilter } from '@/dashboard-filters/components/StageFilter';
import { useDashboardFilterPresets } from '@/dashboard-filters/hooks/useDashboardFilterPresets';
import { useDashboardFilters } from '@/dashboard-filters/hooks/useDashboardFilters';

const StyledPanel = styled.section`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
  padding: 16px;
`;

const StyledPresetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledPresetRow = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`;

export const DashboardFilterPanel = () => {
  const [presetName, setPresetName] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const {
    draftFilters,
    appliedFilters,
    setOwnerId,
    setStartDate,
    setEndDate,
    setStageId,
    applyFilters,
    applyPresetFilters,
    clearFilters,
  } = useDashboardFilters();
  const { presets, savePreset, renamePreset, applyPreset } =
    useDashboardFilterPresets();

  const isSaveDisabled = presetName.trim().length === 0;
  const isRenameDisabled = renameValue.trim().length === 0;

  return (
    <StyledPanel aria-label={t`Dashboard filters`}>
      <OwnerFilter value={draftFilters.ownerId} onChange={setOwnerId} />
      <DateRangeFilter
        startDate={draftFilters.startDate}
        endDate={draftFilters.endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      <StageFilter value={draftFilters.stageId} onChange={setStageId} />
      <button type="button" onClick={applyFilters}>
        {t`Apply`}
      </button>
      <button type="button" onClick={clearFilters}>
        {t`Clear filters`}
      </button>
      <label>
        {t`Preset name`}
        <input
          aria-label={t`Preset name`}
          value={presetName}
          onChange={(event) => setPresetName(event.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={isSaveDisabled}
        onClick={() => {
          savePreset({
            name: presetName,
            filters: appliedFilters,
          });
          setPresetName('');
        }}
      >
        {t`Save as Preset`}
      </button>
      <StyledPresetList>
        {presets.map((preset) => {
          const presetNameForLabel = preset.name;

          return (
            <StyledPresetRow key={preset.id}>
              {editingPresetId === preset.id ? (
                <>
                  <label>
                    {t`Rename preset`}
                    <input
                      aria-label={t`Rename preset`}
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={isRenameDisabled}
                    onClick={() => {
                      renamePreset(preset.id, renameValue);
                      setEditingPresetId(null);
                      setRenameValue('');
                    }}
                  >
                    {t`Confirm rename`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPresetId(null);
                      setRenameValue('');
                    }}
                  >
                    {t`Cancel rename`}
                  </button>
                </>
              ) : (
                <>
                  <span>{preset.name}</span>
                  <button
                    type="button"
                    aria-label={t`Apply preset ${presetNameForLabel}`}
                    onClick={() => {
                      const filters = applyPreset(preset.id);

                      if (filters !== undefined) {
                        applyPresetFilters(filters);
                      }
                    }}
                  >
                    {t`Apply preset ${presetNameForLabel}`}
                  </button>
                  <button
                    type="button"
                    aria-label={t`Rename preset ${presetNameForLabel}`}
                    onClick={() => {
                      setEditingPresetId(preset.id);
                      setRenameValue('');
                    }}
                  >
                    {t`Rename preset ${presetNameForLabel}`}
                  </button>
                </>
              )}
            </StyledPresetRow>
          );
        })}
      </StyledPresetList>
    </StyledPanel>
  );
};
