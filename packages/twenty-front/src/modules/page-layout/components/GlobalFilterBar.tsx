import { type FilterPreset } from '@/page-layout/types/PageLayoutConfig';
import styled from '@emotion/styled';

type GlobalFilterBarProps = {
  presets: FilterPreset[];
  activePresetId?: string;
  canUpdate: boolean;
  onPresetChange: (presetId: string) => void;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme?.spacing?.(2) ?? '8px'};
  padding: ${({ theme }) => `${theme?.spacing?.(2) ?? '8px'} ${theme?.spacing?.(2) ?? '8px'}`};
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme?.font?.color?.secondary ?? 'inherit'};
  font-size: ${({ theme }) => theme?.font?.size?.sm ?? '14px'};
`;

const StyledSelect = styled.select`
  border: 1px solid ${({ theme }) => theme?.border?.color?.medium ?? '#d0d0d0'};
  border-radius: ${({ theme }) => theme?.border?.radius?.sm ?? '4px'};
  padding: ${({ theme }) => `${theme?.spacing?.(1) ?? '4px'} ${theme?.spacing?.(1.5) ?? '6px'}`};
`;

const StyledPresetName = styled.span`
  color: ${({ theme }) => theme?.font?.color?.primary ?? 'inherit'};
  font-size: ${({ theme }) => theme?.font?.size?.sm ?? '14px'};
`;

export const GlobalFilterBar = ({
  presets,
  activePresetId,
  canUpdate,
  onPresetChange,
}: GlobalFilterBarProps) => {
  const activePreset = presets.find((preset) => preset.id === activePresetId);

  if (presets.length === 0) {
    return null;
  }

  return (
    <StyledContainer data-testid="global-filter-bar">
      <StyledLabel htmlFor="global-filter-preset-select">Preset</StyledLabel>
      <StyledSelect
        id="global-filter-preset-select"
        data-testid="global-filter-preset-select"
        value={activePresetId}
        disabled={!canUpdate}
        onChange={(event) => onPresetChange(event.target.value)}
      >
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </StyledSelect>
      <StyledPresetName data-testid="global-filter-active-preset">
        {activePreset?.name ?? ''}
      </StyledPresetName>
      {canUpdate ? (
        <button type="button" data-testid="global-filter-edit-controls">
          Edit filters
        </button>
      ) : null}
    </StyledContainer>
  );
};
