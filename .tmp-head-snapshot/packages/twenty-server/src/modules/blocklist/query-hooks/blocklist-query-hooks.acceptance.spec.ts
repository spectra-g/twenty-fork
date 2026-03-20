import 'reflect-metadata';

import { BadRequestException } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { WorkspaceQueryHookMetadataAccessor } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook-metadata.accessor';
import { WorkspaceQueryHookExplorer } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.explorer';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { WorkspaceQueryHookStorage } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/storage/workspace-query-hook.storage';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { BlocklistValidationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
import { BlocklistCreateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-many.pre-query.hook';
import { BlocklistCreateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-one.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-one.pre-query.hook';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';

const authContext = {
  user: {
    id: 'user-id',
  },
  workspace: {
    id: 'workspace-id',
  },
} as AuthContext;

describe('Blocklist query hooks acceptance', () => {
  let module: TestingModule;
  let workspaceQueryHookService: WorkspaceQueryHookService;

  const blocklistRepository = {
    getById: jest.fn(),
    getByWorkspaceMemberId: jest.fn(),
  };

  const workspaceMemberRepository = {
    findOneByOrFail: jest.fn(),
  };

  const globalWorkspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(async (callback) => callback()),
    getRepository: jest.fn(async () => workspaceMemberRepository),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    workspaceMemberRepository.findOneByOrFail.mockResolvedValue({
      id: 'workspace-member-id',
    });
    blocklistRepository.getByWorkspaceMemberId.mockResolvedValue([]);
    blocklistRepository.getById.mockResolvedValue({
      id: 'blocklist-id',
      handle: 'existing@example.dev',
      workspaceMemberId: 'workspace-member-id',
    });

    module = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [
        WorkspaceQueryHookService,
        WorkspaceQueryHookExplorer,
        WorkspaceQueryHookMetadataAccessor,
        WorkspaceQueryHookStorage,
        BlocklistCreateManyPreQueryHook,
        BlocklistCreateOnePreQueryHook,
        BlocklistUpdateOnePreQueryHook,
        {
          provide: BlocklistValidationService,
          useFactory: () =>
            new BlocklistValidationService(
              blocklistRepository as never,
              globalWorkspaceOrmManager as never,
            ),
        },
        {
          provide: BlocklistRepository,
          useValue: blocklistRepository,
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: globalWorkspaceOrmManager,
        },
      ],
    }).compile();

    await module.init();

    workspaceQueryHookService = module.get(WorkspaceQueryHookService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should accept createOne payloads with description set to null', async () => {
    const payload = {
      data: {
        handle: 'new@example.dev',
        description: null,
      },
    };

    await expect(
      workspaceQueryHookService.executePreQueryHooks(
        authContext,
        'blocklist',
        'createOne',
        payload,
      ),
    ).resolves.toEqual(payload);
  });

  it('should accept createOne payloads with description omitted', async () => {
    const payload = {
      data: {
        handle: 'omitted@example.dev',
      },
    };

    await expect(
      workspaceQueryHookService.executePreQueryHooks(
        authContext,
        'blocklist',
        'createOne',
        payload,
      ),
    ).resolves.toEqual(payload);
  });

  it('should reject invalid createOne handles when description is provided', async () => {
    await expect(
      workspaceQueryHookService.executePreQueryHooks(
        authContext,
        'blocklist',
        'createOne',
        {
          data: {
            handle: 'invalid-handle',
            description: 'present',
          },
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject duplicate createOne handles when description is null', async () => {
    blocklistRepository.getByWorkspaceMemberId.mockResolvedValue([
      {
        handle: 'duplicate@example.dev',
      },
    ]);

    await expect(
      workspaceQueryHookService.executePreQueryHooks(
        authContext,
        'blocklist',
        'createOne',
        {
          data: {
            handle: 'duplicate@example.dev',
            description: null,
          },
        },
      ),
    ).rejects.toThrow('Blocklist handle already exists');
  });

  it('should accept createMany payloads when one description is null', async () => {
    const payload = {
      data: [
        {
          handle: 'batch-one@example.dev',
          description: null,
        },
        {
          handle: 'batch-two@example.dev',
          description: 'present',
        },
      ],
    };

    await expect(
      workspaceQueryHookService.executePreQueryHooks(
        authContext,
        'blocklist',
        'createMany',
        payload,
      ),
    ).resolves.toEqual(payload);
  });

  it('should accept updateOne payloads when description is set to null', async () => {
    const payload = {
      id: 'blocklist-id',
      data: {
        description: null,
      },
    };

    await expect(
      workspaceQueryHookService.executePreQueryHooks(
        authContext,
        'blocklist',
        'updateOne',
        payload,
      ),
    ).resolves.toEqual(payload);
  });

  it('should reject updateOne payloads when handle is an empty string', async () => {
    await expect(
      workspaceQueryHookService.executePreQueryHooks(
        authContext,
        'blocklist',
        'updateOne',
        {
          id: 'blocklist-id',
          data: {
            handle: '',
            description: null,
          },
        },
      ),
    ).rejects.toThrow('Blocklist handle is required');
  });
});
