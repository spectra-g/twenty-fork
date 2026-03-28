import styled from '@emotion/styled';
import { type ChangeEvent } from 'react';

const StyledContainer = styled.div`
  border-top: 1px solid #d8dee6;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
`;

const StyledField = styled.label`
  color: #44556b;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 4px;
`;

const StyledInput = styled.input`
  border: 1px solid #c9d2dc;
  border-radius: 6px;
  font: inherit;
  padding: 6px 10px;
`;

const StyledValidationMessage = styled.span`
  color: #c0392b;
  font-size: 12px;
`;

const StyledActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const StyledActionButton = styled.button`
  background: #ffffff;
  border: 1px solid #c9d2dc;
  border-radius: 6px;
  color: #1d2a3a;
  cursor: pointer;
  font: inherit;
  padding: 6px 10px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const DashboardFilterPresetPickerSaveDialog = ({
  name,
  onChange,
  onClose,
  onSave,
}: {
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSave: () => void;
}) => {
  const isNameValid = name.trim().length > 0;

  return (
    <StyledContainer>
      <StyledField>
        Preset name
        <StyledInput
          aria-label="Preset name"
          value={name}
          onChange={onChange}
        />
      </StyledField>
      {!isNameValid && (
        <StyledValidationMessage>
          Preset name is required
        </StyledValidationMessage>
      )}
      <StyledActions>
        <StyledActionButton type="button" onClick={onClose}>
          Cancel
        </StyledActionButton>
        <StyledActionButton
          type="button"
          disabled={!isNameValid}
          onClick={onSave}
        >
          Save preset
        </StyledActionButton>
      </StyledActions>
    </StyledContainer>
  );
};
