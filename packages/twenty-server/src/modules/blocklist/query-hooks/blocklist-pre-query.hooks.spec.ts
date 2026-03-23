import { BlocklistCreateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-many.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-one.pre-query.hook';

describe('Blocklist pre-query hooks', () => {
  it('should pass create payload with description to the validation service', async () => {
    const validatedPayload = {
      data: [
        {
          handle: 'person@example.com',
          description: 'Normalized description',
          workspaceMemberId: 'workspace-member-id',
        },
      ],
    };
    const blocklistValidationService = {
      validateBlocklistForCreateMany: jest
        .fn()
        .mockResolvedValue(validatedPayload),
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
    ).resolves.toEqual(validatedPayload);

    expect(
      blocklistValidationService.validateBlocklistForCreateMany,
    ).toHaveBeenCalledWith(payload, 'user-id', 'workspace-id');
  });

  it('should pass description-only update payload to the validation service', async () => {
    const validatedPayload = {
      id: 'blocklist-id',
      data: {
        description: 'Normalized updated description',
      },
    };
    const blocklistValidationService = {
      validateBlocklistForUpdateOne: jest
        .fn()
        .mockResolvedValue(validatedPayload),
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
    ).resolves.toEqual(validatedPayload);

    expect(
      blocklistValidationService.validateBlocklistForUpdateOne,
    ).toHaveBeenCalledWith(payload, 'user-id', 'workspace-id');
  });

  it('should pass update payload without description to the validation service unchanged', async () => {
    const validatedPayload = {
      id: 'blocklist-id',
      data: {
        handle: 'person+updated@example.com',
      },
    };
    const blocklistValidationService = {
      validateBlocklistForUpdateOne: jest
        .fn()
        .mockResolvedValue(validatedPayload),
    };
    const hook = new BlocklistUpdateOnePreQueryHook(
      blocklistValidationService as never,
    );
    const payload = {
      id: 'blocklist-id',
      data: {
        handle: 'person+updated@example.com',
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
    ).resolves.toEqual(validatedPayload);

    expect(
      blocklistValidationService.validateBlocklistForUpdateOne,
    ).toHaveBeenCalledWith(payload, 'user-id', 'workspace-id');
  });
});
