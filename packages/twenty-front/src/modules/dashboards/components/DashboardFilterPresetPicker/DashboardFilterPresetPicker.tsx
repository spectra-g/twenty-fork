import { type ChangeEvent, useState } from 'react';
import styled from '@emotion/styled';

import { DashboardFilterPresetPickerSaveDialog } from '@/dashboards/components/DashboardFilterPresetPicker/DashboardFilterPresetPickerSaveDialog';
import { useDashboardPresetsMock } from '@/dashboards/hooks/useDashboardPresetsMock';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { IconChevronDown } from 'twenty-ui/display';

const StyledContainer = styled.div`
  position: relative;
`;

const StyledTriggerButton = styled.button`
  align-items: center;
  background: #f5f7fa;
  border: 1px solid #c9d2dc;
  border-radius: 6px;
  color: #1d2a3a;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  padding: 6px 10px;
`;

const StyledTriggerLabel = styled.span`
  margin-right: 4px;
`;

const StyledPanel = styled.div`
  background: #ffffff;
  border: 1px solid #d8dee6;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(29, 42, 58, 0.12);
  left: 0;
  position: absolute;
  top: calc(100% + 8px);
  z-index: 1;
`;

const StyledListContainer = styled.div`
  max-height: 180px;
  overflow-y: auto;
  padding: 8px;
`;

const StyledMenuButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: #1d2a3a;
  cursor: pointer;
  display: flex;
  font: inherit;
  justify-content: space-between;
  padding: 6px 10px;
  width: 100%;
`;

const StyledSectionActions = styled.div`
  border-top: 1px solid #d8dee6;
  padding: 4px;
`;

const StyledSaveButton = styled.button`
  background: transparent;
  border: none;
  color: #1d2a3a;
  cursor: pointer;
  font: inherit;
  padding: 6px 10px;
  text-align: left;
  width: 100%;
`;

export const DashboardFilterPresetPicker = ({
  dashboardId,
}: {
  dashboardId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const { activePreset, applyPreset, presets, savePreset } =
    useDashboardPresetsMock({
      dashboardId,
    });

  const handleSaveDialogClose = () => {
    setPresetName('');
    setIsSaveDialogOpen(false);
  };

  const handleSave = () => {
    const preset = savePreset(presetName);

    if (preset === null) {
      return;
    }

    handleSaveDialogClose();
    setIsOpen(false);
  };

  const handlePresetNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPresetName(event.target.value);
  };

  return (
    <StyledContainer>
      <StyledTriggerButton
        type="button"
        aria-label="Filter presets"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <StyledTriggerLabel>
          {activePreset?.name ?? 'Filter presets'}
        </StyledTriggerLabel>
        <IconChevronDown />
      </StyledTriggerButton>
      {isOpen && (
        <StyledPanel>
          <DropdownContent>
            <StyledListContainer>
              {presets.map((preset) => (
                <StyledMenuButton
                  key={preset.id}
                  type="button"
                  aria-label={`Apply preset ${preset.name}`}
                  onClick={() => {
                    applyPreset(preset.id);
                    setIsOpen(false);
                  }}
                >
                  {preset.name}
                </StyledMenuButton>
              ))}
            </StyledListContainer>
            <StyledSectionActions>
              <StyledSaveButton
                type="button"
                onClick={() => setIsSaveDialogOpen(true)}
              >
                Save as preset
              </StyledSaveButton>
            </StyledSectionActions>
            {isSaveDialogOpen && (
              <DashboardFilterPresetPickerSaveDialog
                name={presetName}
                onChange={handlePresetNameChange}
                onClose={handleSaveDialogClose}
                onSave={handleSave}
              />
            )}
          </DropdownContent>
        </StyledPanel>
      )}
    </StyledContainer>
  );
};
