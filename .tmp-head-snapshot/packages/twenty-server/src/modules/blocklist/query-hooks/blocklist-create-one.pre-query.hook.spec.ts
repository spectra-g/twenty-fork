import { BlocklistCreateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-one.pre-query.hook';

describe('BlocklistCreateOnePreQueryHook', () => {
  it('should delegate createOne payload validation to the validation service', async () => {
    const blocklistValidationService = {
      validateBlocklistForCreateOne: jest.fn(),
    };

    const hook = new BlocklistCreateOnePreQueryHook(
      blocklistValidationService as never,
    );

    const payload = {
      data: {
        handle: 'new@example.dev',
        description: null,
      },
    };

    await expect(
      hook.execute(
        {
          user: {
            id: 'user-id',
          },
          workspace: {
            id: 'workspace-id',
          },
        } as never,
        'blocklist',
        payload,
      ),
    ).resolves.toEqual(payload);

    expect(
      blocklistValidationService.validateBlocklistForCreateOne,
    ).toHaveBeenCalledWith(payload, 'user-id', 'workspace-id');
  });
});
