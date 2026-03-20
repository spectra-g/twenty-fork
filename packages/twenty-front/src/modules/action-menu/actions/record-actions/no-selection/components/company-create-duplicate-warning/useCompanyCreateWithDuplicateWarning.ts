import { useCallback, useState } from 'react';
import { v4 } from 'uuid';

import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  createCompanyWithoutPersistence,
  findCompanyCreateDuplicateCandidates,
  getEmptyCompanyCreateDuplicateWarningState,
} from '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/companyCreateDuplicateWarning.stub';
import {
  type CompanyCreateDuplicateCandidate,
  type CompanyCreateDuplicateWarningState,
} from '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/companyCreateDuplicateWarning.types';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useCompanyCreateWithDuplicateWarning = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const navigate = useNavigateApp();
  const [warningState, setWarningState] =
    useState<CompanyCreateDuplicateWarningState>(
      getEmptyCompanyCreateDuplicateWarningState(),
    );

  const closeWarning = useCallback(() => {
    setWarningState(getEmptyCompanyCreateDuplicateWarningState());
  }, []);

  const openExistingCompany = useCallback(
    (candidate: CompanyCreateDuplicateCandidate) => {
      closeWarning();

      navigate(AppPath.RecordShowPage, {
        objectNameSingular: objectMetadataItem.nameSingular,
        objectRecordId: candidate.id,
      });
    },
    [closeWarning, navigate, objectMetadataItem.nameSingular],
  );

  const continueAnyway = useCallback(() => {
    // Stubbed until the actual "continue anyway" create path is implemented.
    console.log(
      'TODO(STORY-037): continue company create after duplicate warning',
    );
  }, []);

  const createCompany = useCallback(async () => {
    const recordId = v4();
    const labelIdentifierFieldMetadataItem =
      getLabelIdentifierFieldMetadataItem(objectMetadataItem);

    await createCompanyWithoutPersistence({
      id: recordId,
    });

    closeWarning();

    navigate(
      AppPath.RecordShowPage,
      {
        objectNameSingular: objectMetadataItem.nameSingular,
        objectRecordId: recordId,
      },
      undefined,
      {
        state: {
          isNewRecord: true,
          objectRecordId: recordId,
          labelIdentifierFieldName: labelIdentifierFieldMetadataItem?.name,
        },
      },
    );
  }, [closeWarning, navigate, objectMetadataItem]);

  const startCreateFlow = useCallback(async () => {
    setWarningState({
      candidates: [],
      isLoading: true,
      isOpen: true,
    });

    const candidates = await findCompanyCreateDuplicateCandidates();

    if (candidates.length === 0) {
      await createCompany();

      return;
    }

    setWarningState({
      candidates,
      isLoading: false,
      isOpen: true,
    });
  }, [createCompany]);

  return {
    closeWarning,
    continueAnyway,
    openExistingCompany,
    startCreateFlow,
    warningState,
  };
};
