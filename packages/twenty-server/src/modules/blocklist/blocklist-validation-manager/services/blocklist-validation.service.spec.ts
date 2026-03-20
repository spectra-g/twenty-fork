import { BadRequestException } from '@nestjs/common';

import {
  type CreateManyResolverArgs,
  type UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import {
  type BlocklistCreateInput,
  type BlocklistUpdateInput,
  BlocklistValidationService,
} from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';

describe('BlocklistValidationService', () => {
  it('should keep handle shape validation when description is present on create', async () => {
    const service = new BlocklistValidationService({} as never, {} as never);
    const payload: CreateManyResolverArgs<BlocklistCreateInput> = {
      data: [
        {
          handle: 'not-an-email',
          description: 'Inbound lead from conference follow-up',
          createdAt: '2026-03-20T12:00:00.000Z',
          updatedAt: '2026-03-20T12:00:00.000Z',
        },
      ],
    };

    await expect(
      service.validateBlocklistForCreateMany(payload, 'user-id', 'workspace-id'),
    ).rejects.toThrow(new BadRequestException('Invalid input'));
  });

  it('should keep handle uniqueness validation when description is present on update', async () => {
    const blocklistRepository = {
      getById: jest.fn().mockResolvedValue({
        id: 'blocklist-id',
        handle: 'existing@example.com',
        description: 'Existing description',
        workspaceMemberId: 'workspace-member-id',
      }),
      getByWorkspaceMemberId: jest.fn().mockResolvedValue([
        {
          id: 'duplicate-blocklist-id',
          handle: 'duplicate@example.com',
        },
      ]),
    };
    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation(async (callback: () => Promise<unknown>) => {
          if (callback) {
            return { id: 'workspace-member-id' };
          }

          return undefined;
        }),
      getRepository: jest.fn(),
    };
    const service = new BlocklistValidationService(
      blocklistRepository as never,
      globalWorkspaceOrmManager as never,
    );
    const payload: UpdateOneResolverArgs<BlocklistUpdateInput> = {
      id: 'blocklist-id',
      data: {
        handle: 'duplicate@example.com',
        description: 'Updated after contact requested no follow-up',
      },
    };

    await expect(
      service.validateBlocklistForUpdateOne(payload, 'user-id', 'workspace-id'),
    ).rejects.toThrow(
      new BadRequestException('Blocklist handle already exists'),
    );
  });

  it('should keep workspaceMemberId immutable when description is present on update', async () => {
    const blocklistRepository = {
      getById: jest.fn().mockResolvedValue({
        id: 'blocklist-id',
        handle: 'existing@example.com',
        description: 'Existing description',
        workspaceMemberId: 'workspace-member-id',
      }),
      getByWorkspaceMemberId: jest.fn(),
    };
    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(),
      getRepository: jest.fn(),
    };
    const service = new BlocklistValidationService(
      blocklistRepository as never,
      globalWorkspaceOrmManager as never,
    );
    const payload: UpdateOneResolverArgs<BlocklistUpdateInput> = {
      id: 'blocklist-id',
      data: {
        description: 'Updated after contact requested no follow-up',
        workspaceMemberId: 'different-workspace-member-id',
      },
    };

    await expect(
      service.validateBlocklistForUpdateOne(payload, 'user-id', 'workspace-id'),
    ).rejects.toThrow(
      new BadRequestException('Workspace member cannot be updated'),
    );
    expect(blocklistRepository.getByWorkspaceMemberId).not.toHaveBeenCalled();
    expect(globalWorkspaceOrmManager.executeInWorkspaceContext).not.toHaveBeenCalled();
  });
});
