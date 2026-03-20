import type {
  CreateManyResolverArgs,
  UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  type BlocklistCreateInput,
  BlocklistValidationService,
} from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
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
          createdAt: '2026-03-20T12:00:00.000Z',
          updatedAt: '2026-03-20T12:00:00.000Z',
        },
      ],
    } satisfies CreateManyResolverArgs<BlocklistCreateInput>;

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

  it('should accept a description-only update without checking uniqueness when workspaceMemberId is unchanged', async () => {
    const blocklistRepository = {
      getById: jest.fn().mockResolvedValue({
        id: 'blocklist-id',
        handle: 'prospect@example.com',
        description: 'Existing description',
        workspaceMemberId: 'workspace-member-id',
      }),
      getByWorkspaceMemberId: jest.fn(),
    };
    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(),
      getRepository: jest.fn(),
    };
    const blocklistValidationService = new BlocklistValidationService(
      blocklistRepository as never,
      globalWorkspaceOrmManager as never,
    );
    const hook = new BlocklistUpdateOnePreQueryHook(blocklistValidationService);
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
    expect(blocklistRepository.getById).toHaveBeenCalledWith(
      'blocklist-id',
      'workspace-id',
    );
    expect(blocklistRepository.getByWorkspaceMemberId).not.toHaveBeenCalled();
    expect(globalWorkspaceOrmManager.executeInWorkspaceContext).not.toHaveBeenCalled();
  });

  it('should accept a description-only update when workspaceMemberId is omitted', async () => {
    const blocklistRepository = {
      getById: jest.fn().mockResolvedValue({
        id: 'blocklist-id',
        handle: 'prospect@example.com',
        description: 'Existing description',
        workspaceMemberId: 'workspace-member-id',
      }),
      getByWorkspaceMemberId: jest.fn(),
    };
    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(),
      getRepository: jest.fn(),
    };
    const blocklistValidationService = new BlocklistValidationService(
      blocklistRepository as never,
      globalWorkspaceOrmManager as never,
    );
    const hook = new BlocklistUpdateOnePreQueryHook(blocklistValidationService);
    const payload = {
      id: 'blocklist-id',
      data: {
        description: 'Updated after contact requested no follow-up',
      },
    } as UpdateOneResolverArgs<{
      description: string;
    }>;

    const result = await hook.execute(authContext, 'blocklist', payload);

    expect(result).toBe(payload);
    expect(blocklistRepository.getById).toHaveBeenCalledWith(
      'blocklist-id',
      'workspace-id',
    );
    expect(blocklistRepository.getByWorkspaceMemberId).not.toHaveBeenCalled();
    expect(globalWorkspaceOrmManager.executeInWorkspaceContext).not.toHaveBeenCalled();
  });
});
