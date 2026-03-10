import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { ViewFilterOperand } from 'twenty-shared/types';
import { LightButton } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const DashboardFilterPresetDropdown = () => {
  const { selectedPresetId, isPresetModified, activatePreset } =
    useDashboardFilters();

  const handleSelectPreset = () => {
    const presetFilters: RecordFilter[] = [
      {
        id: 'dashboard-preset-status',
        fieldMetadataId: 'status',
        value: 'won',
        displayValue: 'won',
        type: 'TEXT',
        operand: ViewFilterOperand.IS,
        label: 'status',
      },
    ];

    activatePreset({
      presetId: 'baseline',
      recordFilters: presetFilters,
      recordFilterGroups: [],
    });
  };

  return (
    <StyledContainer data-testid="dashboard-filter-preset-dropdown">
      <LightButton
        title={t`Select preset (stubbed)`}
        accent="tertiary"
        onClick={handleSelectPreset}
        data-testid="dashboard-select-preset"
      >
        {selectedPresetId ? t`Preset selected` : t`Select preset`}
      </LightButton>
      <span data-testid="dashboard-preset-name">{selectedPresetId ?? 'custom'}</span>
      {isPresetModified && (
        <span data-testid="dashboard-preset-modified-indicator">
          {t`modified`}
        </span>
      )}
      <LightButton title={t`Rename preset (coming soon)`} accent="tertiary">
        {t`Rename`}
      </LightButton>
      <LightButton title={t`Delete preset (coming soon)`} accent="tertiary">
        {t`Delete`}
      </LightButton>
    </StyledContainer>
  );
};
