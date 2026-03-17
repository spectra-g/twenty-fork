import { useEffect } from 'react';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { t } from '@lingui/core/macro';

type IndexRecordDuplicateWarningDialogProps = {
  modalId: string;
  objectMetadataItem: ObjectMetadataItem;
  duplicateRecords: ObjectRecord[];
  onCancel: () => void;
  onConfirm: () => void;
};

export const IndexRecordDuplicateWarningDialog = ({
  modalId,
  objectMetadataItem,
  duplicateRecords,
  onCancel,
  onConfirm,
}: IndexRecordDuplicateWarningDialogProps) => {
  const { closeModal, openModal } = useModal();

  useEffect(() => {
    openModal(modalId);

    return () => {
      closeModal(modalId);
    };
  }, [closeModal, modalId, openModal]);

  return (
    <ConfirmationModal
      modalId={modalId}
      title={`Potential duplicate ${objectMetadataItem.labelPlural.toLowerCase()}`}
      subtitle={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
          }}
        >
          <div>{t`We found existing records with matching duplicate criteria.`}</div>
          {duplicateRecords.map((duplicateRecord) => (
            <div
              key={duplicateRecord.id}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <RecordChip
                objectNameSingular={objectMetadataItem.nameSingular}
                record={duplicateRecord}
              />
            </div>
          ))}
        </div>
      }
      onClose={onCancel}
      onConfirmClick={onConfirm}
      confirmButtonText={t`Create anyway`}
      confirmButtonAccent="danger"
    />
  );
};
