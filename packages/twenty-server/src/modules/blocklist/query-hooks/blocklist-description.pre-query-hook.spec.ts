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

  it('should normalize an omitted description to null on createMany', async () => {
    const blocklistValidationService = new BlocklistValidationService(
      {
        getByWorkspaceMemberId: jest.fn().mockResolvedValue([]),
      } as never,
      {
        executeInWorkspaceContext: jest
          .fn()
          .mockResolvedValue({ id: 'workspace-member-id' }),
        getRepository: jest.fn(),
      } as never,
    );
    const hook = new BlocklistCreateManyPreQueryHook(
      blocklistValidationService,
    );
    const payload = {
      data: [
        {
          handle: 'prospect@example.com',
          createdAt: '2026-03-20T12:00:00.000Z',
          updatedAt: '2026-03-20T12:00:00.000Z',
        },
      ],
    } satisfies CreateManyResolverArgs<BlocklistCreateInput>;

    const result = await hook.execute(authContext, 'blocklist', payload);

    expect(result).toBe(payload);
    expect(result.data[0].description).toBeNull();
  });

  it('should normalize an empty description to null on updateOne', async () => {
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
        description: '   ',
        workspaceMemberId: 'workspace-member-id',
      },
    } as UpdateOneResolverArgs<{
      description: string;
      workspaceMemberId: string;
    }>;

    const result = await hook.execute(authContext, 'blocklist', payload);

    expect(result).toBe(payload);
    expect(result.data.description).toBeNull();
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
    expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
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
    expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });

  it('should reject createMany when the description exceeds 255 characters', async () => {
    const blocklistValidationService = new BlocklistValidationService(
      {
        getByWorkspaceMemberId: jest.fn().mockResolvedValue([]),
      } as never,
      {
        executeInWorkspaceContext: jest
          .fn()
          .mockResolvedValue({ id: 'workspace-member-id' }),
        getRepository: jest.fn(),
      } as never,
    );
    const hook = new BlocklistCreateManyPreQueryHook(
      blocklistValidationService,
    );
    const payload = {
      data: [
        {
          handle: 'prospect@example.com',
          description: 'a'.repeat(256),
          createdAt: '2026-03-20T12:00:00.000Z',
          updatedAt: '2026-03-20T12:00:00.000Z',
        },
      ],
    } satisfies CreateManyResolverArgs<BlocklistCreateInput>;

    await expect(
      hook.execute(authContext, 'blocklist', payload),
    ).rejects.toThrow('Description must be 255 characters or less');
  });

  it('should reject updateOne when the description exceeds 255 characters', async () => {
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
        description: 'b'.repeat(256),
      },
    } as UpdateOneResolverArgs<{
      description: string;
    }>;

    await expect(
      hook.execute(authContext, 'blocklist', payload),
    ).rejects.toThrow('Description must be 255 characters or less');
  });
});
