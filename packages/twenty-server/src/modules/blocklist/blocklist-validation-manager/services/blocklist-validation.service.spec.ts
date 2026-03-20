import { BadRequestException } from '@nestjs/common';

import { BlocklistValidationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';

describe('BlocklistValidationService', () => {
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

  let service: BlocklistValidationService;

  beforeEach(() => {
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

    service = new BlocklistValidationService(
      blocklistRepository as never,
      globalWorkspaceOrmManager as never,
    );
  });

  it('should accept createMany payloads with nullable descriptions', async () => {
    await expect(
      service.validateBlocklistForCreateMany(
        {
          data: [
            {
              handle: 'new@example.dev',
              description: null,
            },
            {
              handle: 'next@example.dev',
            },
          ],
        },
        'user-id',
        'workspace-id',
      ),
    ).resolves.toBeUndefined();
  });

  it('should reject malformed handles even when description is present', async () => {
    await expect(
      service.validateBlocklistForCreateMany(
        {
          data: [
            {
              handle: 'bad-handle',
              description: 'present',
            },
          ],
        },
        'user-id',
        'workspace-id',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject duplicate handles during createMany when description is null', async () => {
    blocklistRepository.getByWorkspaceMemberId.mockResolvedValue([
      {
        handle: 'duplicate@example.dev',
      },
    ]);

    await expect(
      service.validateBlocklistForCreateMany(
        {
          data: [
            {
              handle: 'duplicate@example.dev',
              description: null,
            },
          ],
        },
        'user-id',
        'workspace-id',
      ),
    ).rejects.toThrow('Blocklist handle already exists');
  });

  it('should reject createMany payloads with non-string descriptions', async () => {
    await expect(
      service.validateBlocklistForCreateMany(
        {
          data: [
            {
              handle: 'typed@example.dev',
              description: 42 as never,
            },
          ],
        },
        'user-id',
        'workspace-id',
      ),
    ).rejects.toThrow('Blocklist description must be a string or null');
  });

  it('should reject duplicate handles inside the same createMany payload', async () => {
    await expect(
      service.validateBlocklistForCreateMany(
        {
          data: [
            {
              handle: 'duplicate@example.dev',
              description: null,
            },
            {
              handle: 'duplicate@example.dev',
              description: 'same batch',
            },
          ],
        },
        'user-id',
        'workspace-id',
      ),
    ).rejects.toThrow('Blocklist handle already exists');
  });

  it('should accept updateOne payloads that only null out description', async () => {
    await expect(
      service.validateBlocklistForUpdateOne(
        {
          id: 'blocklist-id',
          data: {
            description: null,
          },
        },
        'user-id',
        'workspace-id',
      ),
    ).resolves.toBeUndefined();
  });

  it('should reject empty-string handles during updateOne validation', async () => {
    await expect(
      service.validateBlocklistForUpdateOne(
        {
          id: 'blocklist-id',
          data: {
            handle: '',
            description: null,
          },
        },
        'user-id',
        'workspace-id',
      ),
    ).rejects.toThrow('Blocklist handle is required');
  });

  it('should reject updateOne payloads with non-string descriptions', async () => {
    await expect(
      service.validateBlocklistForUpdateOne(
        {
          id: 'blocklist-id',
          data: {
            description: { invalid: true } as never,
          },
        },
        'user-id',
        'workspace-id',
      ),
    ).rejects.toThrow('Blocklist description must be a string or null');
  });

  it('should skip duplicate lookups when updateOne does not modify the handle', async () => {
    await expect(
      service.validateBlocklistForUpdateOne(
        {
          id: 'blocklist-id',
          data: {
            description: null,
          },
        },
        'user-id',
        'workspace-id',
      ),
    ).resolves.toBeUndefined();

    expect(blocklistRepository.getByWorkspaceMemberId).not.toHaveBeenCalled();
    expect(workspaceMemberRepository.findOneByOrFail).not.toHaveBeenCalled();
  });
});
