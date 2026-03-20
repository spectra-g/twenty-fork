import { type BlocklistItem } from '@/accounts/types/BlocklistItem';
import { TextArea } from '@/ui/input/components/TextArea';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';
import { formatToHumanReadableDate } from '~/utils/date-utils';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Button, IconButton } from 'twenty-ui/input';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { IconX, OverflowingTextWithTooltip } from 'twenty-ui/display';

type SettingsAccountsBlocklistTableRowProps = {
  blocklistItem: BlocklistItem;
  descriptionError?: string;
  descriptionLength?: number;
  editedDescription?: string;
  isEditingDescription?: boolean;
  maxDescriptionLength?: number;
  onCancelDescription?: () => void;
  onDescriptionChange?: (description: string) => void;
  onEditDescription?: (blocklistItem: BlocklistItem) => void;
  onRemove: (id: string) => void;
  onSaveDescription?: () => void;
};

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-end;
`;

const StyledDescriptionEditor = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDescriptionError = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledDescriptionMeta = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledDescriptionCounter = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-left: auto;
`;

export const SettingsAccountsBlocklistTableRow = ({
  blocklistItem,
  descriptionError,
  descriptionLength = 0,
  editedDescription,
  isEditingDescription = false,
  maxDescriptionLength = 255,
  onCancelDescription,
  onDescriptionChange,
  onEditDescription,
  onRemove,
  onSaveDescription,
}: SettingsAccountsBlocklistTableRowProps) => {
  return (
    <TableRow
      key={blocklistItem.id}
      gridAutoColumns="200px 1fr 140px 168px"
      mobileGridAutoColumns="120px 1fr 100px 168px"
    >
      <TableCell>
        <OverflowingTextWithTooltip text={blocklistItem.handle} />
      </TableCell>
      <TableCell>
        {isEditingDescription ? (
          <StyledDescriptionEditor>
            <TextArea
              textAreaId={`blocklist-description-${blocklistItem.id}`}
              placeholder={t`Add a description`}
              value={editedDescription ?? ''}
              maxLength={maxDescriptionLength}
              onChange={onDescriptionChange}
            />
            <StyledDescriptionMeta>
              {descriptionError ? (
                <StyledDescriptionError>
                  {descriptionError}
                </StyledDescriptionError>
              ) : (
                <div />
              )}
              <StyledDescriptionCounter>
                {descriptionLength}/{maxDescriptionLength}
              </StyledDescriptionCounter>
            </StyledDescriptionMeta>
          </StyledDescriptionEditor>
        ) : (
          blocklistItem.description || t`No description`
        )}
      </TableCell>
      <TableCell>
        {blocklistItem.createdAt
          ? formatToHumanReadableDate(blocklistItem.createdAt)
          : ''}
      </TableCell>
      <TableCell align="right">
        <StyledActions>
          {isEditingDescription ? (
            <>
              <Button
                title={t`Cancel`}
                ariaLabel={t`Cancel`}
                variant="tertiary"
                size="small"
                onClick={onCancelDescription}
              />
              <Button
                title={t`Save`}
                ariaLabel={t`Save`}
                variant="secondary"
                size="small"
                onClick={onSaveDescription}
              />
            </>
          ) : (
            <>
              <Button
                title={t`Edit`}
                ariaLabel={t`Edit`}
                variant="tertiary"
                size="small"
                onClick={() => onEditDescription?.(blocklistItem)}
              />
              <IconButton
                onClick={() => {
                  onRemove(blocklistItem.id);
                }}
                ariaLabel={t`Remove from blocklist`}
                variant="tertiary"
                size="small"
                Icon={IconX}
              />
            </>
          )}
        </StyledActions>
      </TableCell>
    </TableRow>
  );
};
