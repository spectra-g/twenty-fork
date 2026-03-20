import { Action } from '@/action-menu/actions/components/Action';
import { CompanyCreateDuplicateWarning } from '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/CompanyCreateDuplicateWarning';
import { useCompanyCreateWithDuplicateWarning } from '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/useCompanyCreateWithDuplicateWarning';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';

export const CreateNewIndexRecordNoSelectionRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  if (objectMetadataItem.nameSingular === 'company') {
    return (
      <CreateNewCompanyIndexRecordNoSelectionRecordAction
        objectMetadataItem={objectMetadataItem}
      />
    );
  }

  return (
    <CreateNewGenericIndexRecordNoSelectionRecordAction
      objectMetadataItem={objectMetadataItem}
    />
  );
};

const CreateNewGenericIndexRecordNoSelectionRecordAction = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ReturnType<
    typeof useContextStoreObjectMetadataItemOrThrow
  >['objectMetadataItem'];
}) => {
  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  return (
    <Action
      onClick={() => createNewIndexRecord({ position: 'first' })}
      closeSidePanelOnCommandMenuListActionExecution={false}
    />
  );
};

const CreateNewCompanyIndexRecordNoSelectionRecordAction = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ReturnType<
    typeof useContextStoreObjectMetadataItemOrThrow
  >['objectMetadataItem'];
}) => {
  const {
    closeWarning,
    continueAnyway,
    openExistingCompany,
    startCreateFlow,
    warningState,
  } = useCompanyCreateWithDuplicateWarning({
    objectMetadataItem,
  });

  return (
    <>
      <Action
        onClick={() => void startCreateFlow()}
        closeSidePanelOnCommandMenuListActionExecution={false}
      />
      <CompanyCreateDuplicateWarning
        warningState={warningState}
        onCandidateClick={openExistingCompany}
        onClose={closeWarning}
        onContinueAnyway={continueAnyway}
      />
    </>
  );
};
