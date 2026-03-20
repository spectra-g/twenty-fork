import { type BlocklistItem } from '@/accounts/types/BlocklistItem';
import { SettingsAccountsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsBlocklistTableRow';
import { normalizeBlocklistDescription } from '@/settings/accounts/utils/normalizeBlocklistDescription';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

type SettingsAccountsBlocklistTableProps = {
  blocklist: BlocklistItem[];
  handleBlockedEmailDescriptionUpdate?: (
    id: string,
    description: string | null,
  ) => Promise<void> | void;
  handleBlockedEmailRemove: (id: string) => void;
};

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const BLOCKLIST_DESCRIPTION_MAX_LENGTH = 255;

export const SettingsAccountsBlocklistTable = ({
  blocklist,
  handleBlockedEmailDescriptionUpdate,
  handleBlockedEmailRemove,
}: SettingsAccountsBlocklistTableProps) => {
  const [blocklistState, setBlocklistState] = useState(blocklist);
  const [descriptionError, setDescriptionError] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editingBlocklistItemId, setEditingBlocklistItemId] = useState<
    string | null
  >(null);

  useEffect(() => {
    setBlocklistState(blocklist);
  }, [blocklist]);

  const handleDescriptionEdit = (blocklistItem: BlocklistItem) => {
    setEditingBlocklistItemId(blocklistItem.id);
    setEditedDescription(blocklistItem.description ?? '');
    setDescriptionError('');
  };

  const handleDescriptionCancel = () => {
    setEditingBlocklistItemId(null);
    setEditedDescription('');
    setDescriptionError('');
  };

  const handleDescriptionChange = (description: string) => {
    setEditedDescription(description);

    if (description.length > BLOCKLIST_DESCRIPTION_MAX_LENGTH) {
      setDescriptionError(t`Description must be 255 characters or less`);
      return;
    }

    setDescriptionError('');
  };

  const handleDescriptionSave = async () => {
    if (editingBlocklistItemId === null) {
      return;
    }

    if (editedDescription.length > BLOCKLIST_DESCRIPTION_MAX_LENGTH) {
      setDescriptionError(t`Description must be 255 characters or less`);
      return;
    }

    const normalizedDescription =
      normalizeBlocklistDescription(editedDescription);

    try {
      await handleBlockedEmailDescriptionUpdate?.(
        editingBlocklistItemId,
        normalizedDescription,
      );
    } catch (error) {
      setDescriptionError(
        error instanceof ApolloError
          ? getErrorMessageFromApolloError(error)
          : error instanceof Error
            ? error.message
            : t`Failed to update description`,
      );

      return;
    }

    setBlocklistState((currentBlocklist) =>
      currentBlocklist.map((blocklistItem) =>
        blocklistItem.id === editingBlocklistItemId
          ? { ...blocklistItem, description: normalizedDescription }
          : blocklistItem,
      ),
    );

    handleDescriptionCancel();
  };

  return (
    <>
      {blocklistState.length > 0 && (
        <StyledTable>
          <TableRow
            gridAutoColumns="200px 1fr 140px 168px"
            mobileGridAutoColumns="120px 1fr 100px 168px"
          >
            <TableHeader>{t`Email/Domain`}</TableHeader>
            <TableHeader>{t`Description`}</TableHeader>
            <TableHeader>{t`Added to blocklist`}</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
          <StyledTableBody>
            {blocklistState.map((blocklistItem) => (
              <SettingsAccountsBlocklistTableRow
                key={blocklistItem.id}
                blocklistItem={blocklistItem}
                descriptionError={descriptionError}
                descriptionLength={editedDescription.length}
                editedDescription={editedDescription}
                isEditingDescription={
                  editingBlocklistItemId === blocklistItem.id
                }
                maxDescriptionLength={BLOCKLIST_DESCRIPTION_MAX_LENGTH}
                onCancelDescription={handleDescriptionCancel}
                onDescriptionChange={handleDescriptionChange}
                onEditDescription={handleDescriptionEdit}
                onRemove={handleBlockedEmailRemove}
                onSaveDescription={handleDescriptionSave}
              />
            ))}
          </StyledTableBody>
        </StyledTable>
      )}
    </>
  );
};
