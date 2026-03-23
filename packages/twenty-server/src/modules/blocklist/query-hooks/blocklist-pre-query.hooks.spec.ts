import { BlocklistCreateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-many.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-one.pre-query.hook';

describe('Blocklist pre-query hooks', () => {
  it('should pass create payload with description to the validation service', async () => {
    const blocklistValidationService = {
      validateBlocklistForCreateMany: jest.fn().mockResolvedValue(undefined),
    };
    const hook = new BlocklistCreateManyPreQueryHook(
      blocklistValidationService as never,
    );
    const payload = {
      data: [
        {
          handle: 'person@example.com',
          description: 'Forward this description',
          workspaceMemberId: 'workspace-member-id',
        },
      ],
    };

    await expect(
      hook.execute(
        {
          user: { id: 'user-id' },
          workspace: { id: 'workspace-id' },
        } as never,
        'blocklist',
        payload as never,
      ),
    ).resolves.toEqual(payload);

    expect(
      blocklistValidationService.validateBlocklistForCreateMany,
    ).toHaveBeenCalledWith(payload, 'user-id', 'workspace-id');
  });

  it('should pass description-only update payload to the validation service', async () => {
    const blocklistValidationService = {
      validateBlocklistForUpdateOne: jest.fn().mockResolvedValue(undefined),
    };
    const hook = new BlocklistUpdateOnePreQueryHook(
      blocklistValidationService as never,
    );
    const payload = {
      id: 'blocklist-id',
      data: {
        description: 'Forward this updated description',
      },
    };

    await expect(
      hook.execute(
        {
          user: { id: 'user-id' },
          workspace: { id: 'workspace-id' },
        } as never,
        'blocklist',
        payload as never,
      ),
    ).resolves.toEqual(payload);

    expect(
      blocklistValidationService.validateBlocklistForUpdateOne,
    ).toHaveBeenCalledWith(payload, 'user-id', 'workspace-id');
  });
});
