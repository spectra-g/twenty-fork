import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { type DashboardPreset } from '@/page-layout/hooks/useDashboardPresetsApi';

const StyledContainer = styled.div`
  position: relative;
`;

const StyledMenu = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 240px;
  padding: 12px;
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 5;
`;

const StyledButton = styled.button`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  padding: 4px 8px;
`;

const StyledPresetRow = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

const StyledPresetName = styled.span`
  flex: 1;
`;

const StyledPresetActions = styled.div`
  display: flex;
  gap: 8px;
`;

const StyledSectionTitle = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const StyledLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledInput = styled.input`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: 6px 8px;
`;

export const DashboardPresetMenu = ({
  presets,
  canManageDashboardPresets,
  onOpenSaveDialog,
  onRenamePreset,
  onDeletePreset,
}: {
  presets: DashboardPreset[];
  canManageDashboardPresets: boolean;
  onOpenSaveDialog: () => void;
  onRenamePreset: (id: string, name: string) => Promise<void>;
  onDeletePreset: (id: string) => Promise<void>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  if (!canManageDashboardPresets) {
    return null;
  }

  const handleRenameClick = (preset: DashboardPreset) => {
    setEditingPresetId(preset.id);
    setEditedName(preset.name);
  };

  const handleRenameSave = async () => {
    if (editingPresetId === null || editedName.trim().length === 0) {
      return;
    }

    await onRenamePreset(editingPresetId, editedName.trim());
    setEditingPresetId(null);
    setEditedName('');
  };

  return (
    <StyledContainer>
      <StyledButton type="button" onClick={() => setIsOpen((value) => !value)}>
        {t`Presets`}
      </StyledButton>
      {isOpen && (
        <StyledMenu>
          <StyledButton type="button" onClick={onOpenSaveDialog}>
            {t`Save preset`}
          </StyledButton>
          <StyledSectionTitle>{t`Saved presets`}</StyledSectionTitle>
          {presets.length === 0 ? (
            <span>{t`No saved presets`}</span>
          ) : (
            presets.map((preset) => {
              const isEditingPreset = editingPresetId === preset.id;

              return (
                <StyledPresetRow key={preset.id}>
                  {isEditingPreset ? (
                    <StyledLabel>
                      <span>{t`Preset name`}</span>
                      <StyledInput
                        aria-label={t`Preset name`}
                        autoFocus
                        value={editedName}
                        onChange={(event) => setEditedName(event.target.value)}
                      />
                    </StyledLabel>
                  ) : (
                    <StyledPresetName>{preset.name}</StyledPresetName>
                  )}
                  <StyledPresetActions>
                    {isEditingPreset ? (
                      <StyledButton
                        type="button"
                        onClick={() => void handleRenameSave()}
                      >
                        {t`Save rename`}
                      </StyledButton>
                    ) : (
                      <StyledButton
                        aria-label={`Rename ${preset.name}`}
                        type="button"
                        onClick={() => handleRenameClick(preset)}
                      >
                        {t`Rename`}
                      </StyledButton>
                    )}
                    <StyledButton
                      aria-label={`Delete ${preset.name}`}
                      type="button"
                      onClick={() => void onDeletePreset(preset.id)}
                    >
                      {t`Delete`}
                    </StyledButton>
                  </StyledPresetActions>
                </StyledPresetRow>
              );
            })
          )}
        </StyledMenu>
      )}
    </StyledContainer>
  );
};
