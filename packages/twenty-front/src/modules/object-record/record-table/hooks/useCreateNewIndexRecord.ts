import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { type RecordGqlOperationFindDuplicatesResult } from '@/object-record/graphql/types/RecordGqlOperationFindDuplicatesResults';
import { useFindDuplicateRecordsQuery } from '@/object-record/hooks/useFindDuplicatesRecordsQuery';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { IndexRecordDuplicateWarningDialog } from '@/object-record/record-table/components/IndexRecordDuplicateWarningDialog';
import { useBuildRecordInputFromFilters } from '@/object-record/record-table/hooks/useBuildRecordInputFromFilters';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { getFindDuplicateRecordsQueryResponseField } from '@/object-record/utils/getFindDuplicateRecordsQueryResponseField';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { createElement, useCallback, useId, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { findByProperty, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type UseCreateNewIndexRecordProps = {
  objectMetadataItem: ObjectMetadataItem;
};

type PendingCreateState = {
  duplicateRecords: ObjectRecord[];
  mergedRecordInput: Partial<ObjectRecord>;
  recordId: string;
  reject: (reason?: unknown) => void;
  resolve: (value: ObjectRecord | null) => void;
};

export const useCreateNewIndexRecord = ({
  objectMetadataItem,
}: UseCreateNewIndexRecordProps) => {
  const apolloCoreClient = useApolloCoreClient();
  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const store = useStore();
  const recordIndexRecordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );
  const { closeModal } = useModal();
  const duplicateWarningModalId = `index-record-duplicate-warning-${useId().replaceAll(
    ':',
    '-',
  )}`;
  const [pendingCreateState, setPendingCreateState] =
    useState<PendingCreateState | null>(null);

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { closeCommandMenu } = useCommandMenu();

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const navigate = useNavigateApp();

  const { openRecordTitleCell } = useRecordTitleCell();

  const { buildRecordInputFromFilters } = useBuildRecordInputFromFilters({
    objectMetadataItem,
  });

  const { buildRecordInputFromRLSPredicates } =
    useBuildRecordInputFromRLSPredicates({
      objectMetadataItem,
    });

  const createRecord = useCallback(
    async ({
      recordId,
      recordInput,
    }: {
      recordId: string;
      recordInput: Partial<ObjectRecord>;
    }) => {
      const recordIndexOpenRecordIn = store.get(
        recordIndexOpenRecordInState.atom,
      );

      const createdRecord = await createOneRecord({
        id: recordId,
        ...recordInput,
      });

      if (
        recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL &&
        canOpenObjectInSidePanel(objectMetadataItem.nameSingular)
      ) {
        openRecordInCommandMenu({
          recordId,
          objectNameSingular: objectMetadataItem.nameSingular,
          isNewRecord: true,
        });

        const labelIdentifierFieldMetadataItem =
          getLabelIdentifierFieldMetadataItem(objectMetadataItem);

        if (isDefined(labelIdentifierFieldMetadataItem)) {
          openRecordTitleCell({
            recordId,
            fieldMetadataItemId: labelIdentifierFieldMetadataItem.id,
            instanceId: getRecordFieldInputInstanceId({
              recordId,
              fieldName: labelIdentifierFieldMetadataItem.name,
              prefix: RecordTitleCellContainerType.PageHeader,
            }),
          });
        }
      } else {
        const labelIdentifierFieldMetadataItem =
          getLabelIdentifierFieldMetadataItem(objectMetadataItem);

        closeCommandMenu();
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
      }

      if (isDefined(recordIndexGroupFieldMetadataItem)) {
        const recordGroup = recordGroupDefinitions.find(
          findByProperty(
            'value',
            createdRecord[recordIndexGroupFieldMetadataItem.name],
          ),
        );

        if (isDefined(recordGroup)) {
          const currentRecordIds = store.get(
            recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
          );

          if (recordInput.position === 'first') {
            const newRecordIds = [createdRecord.id, ...currentRecordIds];

            store.set(
              recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
              newRecordIds,
            );
          } else {
            const newRecordIds = [...currentRecordIds, createdRecord.id];

            store.set(
              recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
              newRecordIds,
            );
          }
        }
      }

      upsertRecordsInStore({ partialRecords: [createdRecord] });

      return createdRecord;
    },
    [
      store,
      createOneRecord,
      navigate,
      objectMetadataItem,
      openRecordInCommandMenu,
      openRecordTitleCell,
      recordGroupDefinitions,
      recordIndexGroupFieldMetadataItem,
      recordIndexRecordIdsByGroupCallbackState,
      upsertRecordsInStore,
      closeCommandMenu,
    ],
  );

  const { findDuplicateRecordsQuery } = useFindDuplicateRecordsQuery({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const handleCancelDuplicateWarning = useCallback(() => {
    closeModal(duplicateWarningModalId);
    pendingCreateState?.resolve(null);
    setPendingCreateState(null);
  }, [closeModal, duplicateWarningModalId, pendingCreateState]);

  const handleConfirmDuplicateWarning = useCallback(async () => {
    if (!pendingCreateState) {
      return;
    }

    closeModal(duplicateWarningModalId);

    try {
      const createdRecord = await createRecord({
        recordId: pendingCreateState.recordId,
        recordInput: pendingCreateState.mergedRecordInput,
      });

      pendingCreateState.resolve(createdRecord);
      setPendingCreateState(null);
    } catch (error) {
      pendingCreateState.reject(error);
      setPendingCreateState(null);
      throw error;
    }
  }, [closeModal, createRecord, duplicateWarningModalId, pendingCreateState]);

  const createNewIndexRecord = useCallback(
    async (recordInput?: Partial<ObjectRecord>) => {
      const recordId = v4();
      const recordInputFromRLSPredicates = buildRecordInputFromRLSPredicates();
      const recordInputFromFilters = buildRecordInputFromFilters();

      const mergedRecordInput = {
        ...recordInputFromRLSPredicates,
        ...recordInputFromFilters,
        ...recordInput,
      };

      const shouldCheckDuplicates =
        isDefined(objectMetadataItem.duplicateCriteria) &&
        Object.keys(mergedRecordInput).length > 0;

      if (!shouldCheckDuplicates) {
        return createRecord({
          recordId,
          recordInput: mergedRecordInput,
        });
      }

      const queryResponseField = getFindDuplicateRecordsQueryResponseField(
        objectMetadataItem.nameSingular,
      );

      const duplicateRecordsResponse =
        await apolloCoreClient.query<RecordGqlOperationFindDuplicatesResult>({
          fetchPolicy: 'no-cache',
          query: findDuplicateRecordsQuery,
          variables: {
            data: [mergedRecordInput],
          },
        });

      const duplicateRecords =
        duplicateRecordsResponse.data?.[queryResponseField]?.flatMap(
          (recordConnection) =>
            getRecordsFromRecordConnection({
              recordConnection,
            }),
        ) ?? [];

      if (duplicateRecords.length === 0) {
        return createRecord({
          recordId,
          recordInput: mergedRecordInput,
        });
      }

      return await new Promise<ObjectRecord | null>((resolve, reject) => {
        setPendingCreateState({
          duplicateRecords,
          mergedRecordInput,
          recordId,
          reject,
          resolve,
        });
      });
    },
    [
      apolloCoreClient,
      buildRecordInputFromFilters,
      buildRecordInputFromRLSPredicates,
      createRecord,
      findDuplicateRecordsQuery,
      objectMetadataItem,
    ],
  );

  return {
    createNewIndexRecord,
    duplicateWarningDialog: pendingCreateState
      ? createElement(IndexRecordDuplicateWarningDialog, {
          modalId: duplicateWarningModalId,
          objectMetadataItem,
          duplicateRecords: pendingCreateState.duplicateRecords,
          onCancel: handleCancelDuplicateWarning,
          onConfirm: handleConfirmDuplicateWarning,
        })
      : null,
  };
};
