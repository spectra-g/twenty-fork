import { type BlocklistItem } from '@/accounts/types/BlocklistItem';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsBlocklistInput';
import { SettingsAccountsBlocklistTable } from '@/settings/accounts/components/SettingsAccountsBlocklistTable';
import { useLingui } from '@lingui/react/macro';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { isDefined } from 'twenty-shared/utils';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { H2Title } from 'twenty-ui/display';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Section } from 'twenty-ui/layout';

export const SettingsAccountsBlocklistSection = () => {
  const { t } = useLingui();

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const currentWorkspaceMemberId = currentWorkspaceMember?.id ?? '';

  const { records: blocklist } = useFindManyRecords<BlocklistItem>({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
    filter: {
      workspaceMemberId: {
        in: [currentWorkspaceMemberId],
      },
    },
    skip: !isDefined(currentWorkspaceMember),
  });

  const { createOneRecord: createBlocklistItem } =
    useCreateOneRecord<BlocklistItem>({
      objectNameSingular: CoreObjectNameSingular.Blocklist,
    });

  const { deleteOneRecord: deleteBlocklistItem } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
  });
  const { updateOneRecord } = useUpdateOneRecord();

  const handleBlockedEmailRemove = (id: string) => {
    deleteBlocklistItem(id);
  };

  const updateBlockedEmailList = (handle: string) => {
    createBlocklistItem({
      handle,
      description: null,
      workspaceMemberId: currentWorkspaceMember?.id,
    });
  };

  const handleBlockedEmailDescriptionUpdate = async (
    id: string,
    description: string | null,
  ) => {
    await updateOneRecord<BlocklistItem>({
      objectNameSingular: CoreObjectNameSingular.Blocklist,
      idToUpdate: id,
      updateOneRecordInput: {
        description,
      },
    });
  };

  return (
    <Section>
      <H2Title
        title={t`Blocklist`}
        description={t`Exclude the following people and domains from my email sync. Internal conversations will not be imported`}
      />
      <SettingsAccountsBlocklistInput
        blockedEmailOrDomainList={blocklist.map((item) => item.handle)}
        updateBlockedEmailList={updateBlockedEmailList}
      />
      <SettingsAccountsBlocklistTable
        blocklist={blocklist}
        handleBlockedEmailDescriptionUpdate={
          handleBlockedEmailDescriptionUpdate
        }
        handleBlockedEmailRemove={handleBlockedEmailRemove}
      />
    </Section>
  );
};
