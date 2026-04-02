import { useState } from 'react';
import { t } from '@lingui/core/macro';

import { DashboardPresetSaveModal } from '@/dashboard/components/DashboardPresetSaveModal';
import { type DashboardPreset } from '@/dashboard/types/DashboardPreset';

type DashboardPresetDropdownProps = {
  onApplyPreset: (presetId: string) => void;
  onSavePreset: (name: string) => void;
  presets: DashboardPreset[];
};

export const DashboardPresetDropdown = ({
  onApplyPreset,
  onSavePreset,
  presets,
}: DashboardPresetDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

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
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.id)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}
      {isSaveModalOpen && (
        <DashboardPresetSaveModal
          onClose={() => setIsSaveModalOpen(false)}
          onSave={onSavePreset}
        />
      )}
    </div>
  );
};
