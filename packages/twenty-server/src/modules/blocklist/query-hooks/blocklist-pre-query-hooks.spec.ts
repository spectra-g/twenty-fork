import { BadRequestException } from '@nestjs/common';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

import { BlocklistCreateManyPreQueryHook } from './blocklist-create-many.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from './blocklist-update-one.pre-query.hook';

const authContext = {
  user: {
    id: 'user-id',
  },
  workspace: {
    id: 'workspace-id',
  },
} as AuthContext;

describe('Blocklist pre-query hooks', () => {
  const mockBlocklistValidationService = {
    validateBlocklistForCreateMany: jest.fn(),
    validateBlocklistForUpdateOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should forward description through the createMany hook', async () => {
    const hook = new BlocklistCreateManyPreQueryHook(
      mockBlocklistValidationService as never,
    );
    const payload = {
      data: [
        {
          handle: 'create@example.com',
          description: 'Keep this description intact',
          workspaceMemberId: 'workspace-member-id',
        },
      ],
    };

    const result = await hook.execute(
      authContext,
      'blocklist',
      payload as never,
    );

    expect(
      mockBlocklistValidationService.validateBlocklistForCreateMany,
    ).toHaveBeenCalledWith(payload, 'user-id', 'workspace-id');
    expect(result.data[0].description).toBe('Keep this description intact');
  });

  it('should forward description through the updateOne hook', async () => {
    const hook = new BlocklistUpdateOnePreQueryHook(
      mockBlocklistValidationService as never,
    );
    const payload = {
      id: 'blocklist-id',
      data: {
        handle: '@example.com',
        description: 'Updated description',
        workspaceMemberId: 'workspace-member-id',
      },
    };

    const result = await hook.execute(
      authContext,
      'blocklist',
      payload as never,
    );

    expect(
      mockBlocklistValidationService.validateBlocklistForUpdateOne,
    ).toHaveBeenCalledWith(payload, 'user-id', 'workspace-id');
    expect(result.data.description).toBe('Updated description');
  });

  it('should require a user id before running the createMany hook', async () => {
    const hook = new BlocklistCreateManyPreQueryHook(
      mockBlocklistValidationService as never,
    );

    await expect(
      hook.execute(
        {
          ...authContext,
          user: undefined,
        } as AuthContext,
        'blocklist',
        { data: [] } as never,
      ),
    ).rejects.toThrow(new BadRequestException('User id is required'));
  });
});
