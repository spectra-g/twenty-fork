import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

const StyledOverlay = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.overlayPrimary};
  display: flex;
  inset: 0;
  justify-content: center;
  position: fixed;
  z-index: 10;
`;

const StyledDialog = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 320px;
  padding: 20px;
`;

const StyledTitle = styled.h2`
  font-size: 18px;
  margin: 0;
`;

const StyledActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 6px;
`;

const StyledInput = styled.input`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: 8px 10px;
`;

const StyledButton = styled.button`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  padding: 6px 10px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const DashboardSavePresetDialog = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}) => {
  const [name, setName] = useState('');

  if (!isOpen) {
    return null;
  }

  const trimmedName = name.trim();

  const handleSave = async () => {
    if (trimmedName.length === 0) {
      return;
    }

    await onSave(trimmedName);
    setName('');
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <StyledOverlay>
      <StyledDialog aria-labelledby="dashboard-save-preset-title" role="dialog">
        <StyledTitle id="dashboard-save-preset-title">{t`Save preset`}</StyledTitle>
        <StyledLabel htmlFor="dashboard-preset-name-input">
          {t`Preset name`}
          <StyledInput
            autoFocus
            id="dashboard-preset-name-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </StyledLabel>
        <StyledActions>
          <StyledButton type="button" onClick={handleClose}>
            {t`Cancel`}
          </StyledButton>
          <StyledButton
            type="button"
            disabled={trimmedName.length === 0}
            onClick={() => void handleSave()}
          >
            {t`Save`}
          </StyledButton>
        </StyledActions>
      </StyledDialog>
    </StyledOverlay>
  );
};
