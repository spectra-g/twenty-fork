import { useState } from 'react';
import { t } from '@lingui/core/macro';

import { DashboardPresetSaveModal } from '@/dashboard/components/DashboardPresetSaveModal';
import { type DashboardPreset } from '@/dashboard/types/DashboardPreset';

type DashboardPresetDropdownProps = {
  onApplyPreset: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
  onRenamePreset: (presetId: string, name: string) => void;
  onSavePreset: (name: string) => void;
  presets: DashboardPreset[];
};

export const DashboardPresetDropdown = ({
  onApplyPreset,
  onDeletePreset,
  onRenamePreset,
  onSavePreset,
  presets,
}: DashboardPresetDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<DashboardPreset | null>(
    null,
  );
  const [presetToRename, setPresetToRename] = useState<DashboardPreset | null>(
    null,
  );
  const [renamePresetName, setRenamePresetName] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleOpenRename = (preset: DashboardPreset) => {
    setPresetToRename(preset);
    setRenamePresetName(preset.name);
  };

  const handleRenamePreset = () => {
    if (!presetToRename) {
      return;
    }

    onRenamePreset(presetToRename.id, renamePresetName);
    setPresetToRename(null);
    setRenamePresetName('');
  };

  const handleDeletePreset = () => {
    if (!presetToDelete) {
      return;
    }

    onDeletePreset(presetToDelete.id);
    setPresetToDelete(null);
  };

  return (
    <div>
      <button type="button" onClick={() => setIsOpen((current) => !current)}>
        {t`Presets`}
      </button>
      {isOpen && (
        <div>
          <button type="button" onClick={() => setIsSaveModalOpen(true)}>
            {t`Save Preset`}
          </button>
          {presets.map((preset) => (
            <div key={preset.id}>
              <button type="button" onClick={() => onApplyPreset(preset.id)}>
                {preset.name}
              </button>
              <button
                aria-label={t`Rename preset ${preset.name}`}
                type="button"
                onClick={() => handleOpenRename(preset)}
              >
                {t`Rename`}
              </button>
              <button
                aria-label={t`Delete preset ${preset.name}`}
                type="button"
                onClick={() => setPresetToDelete(preset)}
              >
                {t`Delete`}
              </button>
            </div>
          ))}
        </div>
      )}
      {isSaveModalOpen && (
        <DashboardPresetSaveModal
          onClose={() => setIsSaveModalOpen(false)}
          onSave={onSavePreset}
        />
      )}
      {presetToRename && (
        <div aria-label={t`Rename preset`} role="dialog">
          <label htmlFor="dashboard-preset-rename">{t`Rename preset`}</label>
          <input
            id="dashboard-preset-rename"
            value={renamePresetName}
            onChange={(event) => setRenamePresetName(event.target.value)}
          />
          <button type="button" onClick={handleRenamePreset}>
            {t`Rename`}
          </button>
          <button type="button" onClick={() => setPresetToRename(null)}>
            {t`Cancel`}
          </button>
        </div>
      )}
      {presetToDelete && (
        <div aria-label={t`Delete preset`} role="dialog">
          <p>
            {t`Delete preset "${presetToDelete.name}"? This action cannot be undone.`}
          </p>
          <button type="button" onClick={() => setPresetToDelete(null)}>
            {t`Cancel`}
          </button>
          <button type="button" onClick={handleDeletePreset}>
            {t`Delete`}
          </button>
        </div>
      )}
    </div>
  );
};
