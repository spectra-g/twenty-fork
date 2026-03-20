import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { BlocklistCreateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-many.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-one.pre-query.hook';

describe('Blocklist description pre-query hooks', () => {
  const authContext = {
    user: {
      id: 'user-id',
    },
    workspace: {
      id: 'workspace-id',
    },
  } as AuthContext;

  it('should pass description through createMany unchanged', async () => {
    const blocklistValidationService = {
      validateBlocklistForCreateMany: jest.fn(),
    };
    const hook = new BlocklistCreateManyPreQueryHook(
      blocklistValidationService as never,
    );
    const payload = {
      data: [
        {
          handle: 'prospect@example.com',
          description: 'Inbound lead from conference follow-up',
          workspaceMemberId: 'workspace-member-id',
          createdAt: '2026-03-20T12:00:00.000Z',
          updatedAt: '2026-03-20T12:00:00.000Z',
        },
      ],
    } as CreateManyResolverArgs<{
      handle: string;
      description: string;
      workspaceMemberId: string;
      createdAt: string;
      updatedAt: string;
    }>;

    const result = await hook.execute(authContext, 'blocklist', payload);

    expect(result).toBe(payload);
    expect(blocklistValidationService.validateBlocklistForCreateMany).toHaveBeenCalledWith(
      payload,
      'user-id',
      'workspace-id',
    );
    expect(result.data[0].description).toBe(
      'Inbound lead from conference follow-up',
    );
  });

  it('should pass description through updateOne unchanged', async () => {
    const blocklistValidationService = {
      validateBlocklistForUpdateOne: jest.fn(),
    };
    const hook = new BlocklistUpdateOnePreQueryHook(
      blocklistValidationService as never,
    );
    const payload = {
      id: 'blocklist-id',
      data: {
        description: 'Updated after contact requested no follow-up',
        workspaceMemberId: 'workspace-member-id',
      },
    } as UpdateOneResolverArgs<{
      description: string;
      workspaceMemberId: string;
    }>;

    const result = await hook.execute(authContext, 'blocklist', payload);

    expect(result).toBe(payload);
    expect(blocklistValidationService.validateBlocklistForUpdateOne).toHaveBeenCalledWith(
      payload,
      'user-id',
      'workspace-id',
    );
    expect(result.data.description).toBe(
      'Updated after contact requested no follow-up',
    );
  });
});
