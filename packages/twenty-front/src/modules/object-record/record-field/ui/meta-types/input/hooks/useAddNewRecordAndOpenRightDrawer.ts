import { createElement, useCallback, useId, useState } from 'react';
import { v4 } from 'uuid';

import { SEARCH_QUERY } from '@/command-menu/graphql/queries/search';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { type RecordGqlOperationFindDuplicatesResult } from '@/object-record/graphql/types/RecordGqlOperationFindDuplicatesResults';
import { useFindDuplicateRecordsQuery } from '@/object-record/hooks/useFindDuplicatesRecordsQuery';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { IndexRecordDuplicateWarningDialog } from '@/object-record/record-table/components/IndexRecordDuplicateWarningDialog';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getFindDuplicateRecordsQueryResponseField } from '@/object-record/utils/getFindDuplicateRecordsQueryResponseField';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { getOperationName } from '@apollo/client/utilities';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type useAddNewRecordAndOpenRightDrawerProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
  relationObjectMetadataNameSingular: string;
  relationObjectMetadataItem: ObjectMetadataItem;
  relationFieldMetadataItem: FieldMetadataItem;
  recordId: string;
};

type PendingCreateState = {
  createRecordPayload: Record<string, unknown>;
  duplicateRecords: ObjectRecord[];
  reject: (reason?: unknown) => void;
  resolve: (value: string | null) => void;
};

export const useAddNewRecordAndOpenRightDrawer = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataNameSingular,
  relationObjectMetadataItem,
  relationFieldMetadataItem,
  recordId,
}: useAddNewRecordAndOpenRightDrawerProps) => {
  const setViewableRecordId = useSetAtomState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetAtomState(
    viewableRecordNameSingularState,
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const { updateOneRecord } = useUpdateOneRecord();

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const apolloCoreClient = useApolloCoreClient();
  const duplicateWarningModalId = `relation-duplicate-warning-${useId().replaceAll(
    ':',
    '-',
  )}`;
  const [pendingCreateState, setPendingCreateState] =
    useState<PendingCreateState | null>(null);

  if (
    relationObjectMetadataNameSingular === 'workspaceMember' ||
    !isDefined(objectMetadataItem.nameSingular)
  ) {
    return {
      createNewRecordAndOpenRightDrawer: undefined,
      duplicateWarningDialog: null,
    };
  }
  const relationFieldMetadataItemRelationType =
    relationFieldMetadataItem.settings?.relationType;

  const { findDuplicateRecordsQuery } = useFindDuplicateRecordsQuery({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const openRecord = useCallback(
    (targetRecordId: string) => {
      setViewableRecordId(targetRecordId);
      setViewableRecordNameSingular(relationObjectMetadataNameSingular);
      openRecordInCommandMenu({
        recordId: targetRecordId,
        objectNameSingular: relationObjectMetadataNameSingular,
      });
    },
    [
      openRecordInCommandMenu,
      relationObjectMetadataNameSingular,
      setViewableRecordId,
      setViewableRecordNameSingular,
    ],
  );

  const createRecordAndOpenRightDrawer = useCallback(
    async (createRecordPayload: Record<string, unknown>) => {
      const newRecordId = createRecordPayload.id as string;

      await createOneRecord(createRecordPayload);

      if (relationFieldMetadataItemRelationType === RelationType.ONE_TO_MANY) {
        await updateOneRecord({
          objectNameSingular:
            objectMetadataItem.nameSingular ?? 'workspaceMember',
          idToUpdate: recordId,
          updateOneRecordInput: {
            [`${fieldMetadataItem.name}Id`]: newRecordId,
          },
        });
      }

      apolloCoreClient.refetchQueries({
        include: [getOperationName(SEARCH_QUERY) ?? ''],
      });

      openRecord(newRecordId);

      return newRecordId;
    },
    [
      apolloCoreClient,
      createOneRecord,
      fieldMetadataItem.name,
      objectMetadataItem.nameSingular,
      openRecord,
      recordId,
      relationFieldMetadataItemRelationType,
      updateOneRecord,
    ],
  );

  const handleCancelDuplicateWarning = useCallback(() => {
    pendingCreateState?.resolve(null);
    setPendingCreateState(null);
  }, [pendingCreateState]);

  const handleConfirmDuplicateWarning = useCallback(async () => {
    if (!pendingCreateState) {
      return;
    }

    try {
      const createdRecordId = await createRecordAndOpenRightDrawer(
        pendingCreateState.createRecordPayload,
      );

      pendingCreateState.resolve(createdRecordId);
      setPendingCreateState(null);
    } catch (error) {
      pendingCreateState.reject(error);
      setPendingCreateState(null);
      throw error;
    }
  }, [createRecordAndOpenRightDrawer, pendingCreateState]);

  const handleSelectDuplicateWarning = useCallback(
    (targetRecordId: string) => {
      openRecord(targetRecordId);
      pendingCreateState?.resolve(null);
      setPendingCreateState(null);
    },
    [openRecord, pendingCreateState],
  );

  return {
    createNewRecordAndOpenRightDrawer: async (searchInput?: string) => {
      const newRecordId = v4();

      const createRecordPayload = buildRecordLabelPayload({
        id: newRecordId,
        searchInput,
        objectMetadataItem: relationObjectMetadataItem,
      });

      if (relationFieldMetadataItemRelationType === RelationType.MANY_TO_ONE) {
        const gqlField =
          relationFieldMetadataItem.type === FieldMetadataType.RELATION
            ? relationFieldMetadataItem.name
            : computeMorphRelationFieldName({
                fieldName: relationFieldMetadataItem.name,
                relationType: relationFieldMetadataItemRelationType,
                targetObjectMetadataNameSingular:
                  objectMetadataItem.nameSingular,
                targetObjectMetadataNamePlural: objectMetadataItem.namePlural,
              });

        createRecordPayload[`${gqlField}Id`] = recordId;
      }

      const { id: _, ...duplicateQueryInput } = createRecordPayload;
      const shouldCheckDuplicates =
        isDefined(relationObjectMetadataItem.duplicateCriteria) &&
        Object.keys(duplicateQueryInput).length > 0;

      if (!shouldCheckDuplicates) {
        return createRecordAndOpenRightDrawer(createRecordPayload);
      }

      const queryResponseField = getFindDuplicateRecordsQueryResponseField(
        relationObjectMetadataNameSingular,
      );

      const duplicateRecordsResponse =
        await apolloCoreClient.query<RecordGqlOperationFindDuplicatesResult>({
          fetchPolicy: 'no-cache',
          query: findDuplicateRecordsQuery,
          variables: {
            data: [duplicateQueryInput],
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
        return createRecordAndOpenRightDrawer(createRecordPayload);
      }

      return await new Promise<string | null>((resolve, reject) => {
        setPendingCreateState({
          createRecordPayload,
          duplicateRecords,
          reject,
          resolve,
        });
      });
    },
    duplicateWarningDialog: pendingCreateState
      ? createElement(IndexRecordDuplicateWarningDialog, {
          modalId: duplicateWarningModalId,
          objectMetadataItem: relationObjectMetadataItem,
          duplicateRecords: pendingCreateState.duplicateRecords,
          onCancel: handleCancelDuplicateWarning,
          onConfirm: handleConfirmDuplicateWarning,
          onSelectDuplicate: handleSelectDuplicateWarning,
        })
      : null,
  };
};
