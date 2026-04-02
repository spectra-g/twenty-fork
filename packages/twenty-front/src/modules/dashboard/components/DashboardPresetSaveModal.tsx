import { useState } from 'react';
import { t } from '@lingui/core/macro';

type DashboardPresetSaveModalProps = {
  onClose: () => void;
  onSave: (name: string) => void;
};

export const DashboardPresetSaveModal = ({
  onClose,
  onSave,
}: DashboardPresetSaveModalProps) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim().length === 0) {
      return;
    }

    onSave(name);
    onClose();
  };

  return (
    <div aria-label={t`Save Preset`} role="dialog">
      <label htmlFor="dashboard-preset-name">{t`Preset name`}</label>
      <input
        id="dashboard-preset-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <button type="button" onClick={handleSave}>
        {t`Save`}
      </button>
      <button type="button" onClick={onClose}>
        {t`Cancel`}
      </button>
    </div>
  );
};
