import { BlocklistValidationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';

const createBlocklistRepositoryMock = () => ({
  getById: jest.fn(),
  getByWorkspaceMemberId: jest.fn(),
});

const createGlobalWorkspaceOrmManagerMock = () => ({
  executeInWorkspaceContext: jest.fn(),
  getRepository: jest.fn(),
});

describe('BlocklistValidationService', () => {
  it('should return create payload unchanged when description is present', async () => {
    const blocklistRepository = createBlocklistRepositoryMock();
    const globalWorkspaceOrmManager = createGlobalWorkspaceOrmManagerMock();
    const service = new BlocklistValidationService(
      blocklistRepository as never,
      globalWorkspaceOrmManager as never,
    );
    const payload = {
      data: [
        {
          handle: 'person@example.com',
          description: 'Keep this description',
          workspaceMemberId: 'workspace-member-id',
          id: 'blocklist-id',
          createdAt: '2026-03-23T00:00:00.000Z',
          updatedAt: '2026-03-23T00:00:00.000Z',
        },
      ],
    };

    jest.spyOn(service, 'validateSchema').mockResolvedValue(undefined);
    jest
      .spyOn(service, 'validateUniquenessForCreateMany')
      .mockResolvedValue(undefined);

    await expect(
      service.validateBlocklistForCreateMany(
        payload,
        'user-id',
        'workspace-id',
      ),
    ).resolves.toEqual(payload);
  });

  it('should return description-only update payload unchanged', async () => {
    const blocklistRepository = createBlocklistRepositoryMock();
    const globalWorkspaceOrmManager = createGlobalWorkspaceOrmManagerMock();
    const service = new BlocklistValidationService(
      blocklistRepository as never,
      globalWorkspaceOrmManager as never,
    );
    const payload = {
      id: 'blocklist-id',
      data: {
        description: 'Keep this updated description',
      },
    };

    blocklistRepository.getById.mockResolvedValue({
      id: 'blocklist-id',
      handle: 'person@example.com',
      description: null,
      workspaceMemberId: 'workspace-member-id',
      createdAt: '2026-03-23T00:00:00.000Z',
      updatedAt: '2026-03-23T00:00:00.000Z',
    });

    await expect(
      service.validateBlocklistForUpdateOne(
        payload as never,
        'user-id',
        'workspace-id',
      ),
    ).resolves.toEqual(payload);

    expect(blocklistRepository.getByWorkspaceMemberId).not.toHaveBeenCalled();
  });

  it('should reject invalid handle format when description is present', async () => {
    const service = new BlocklistValidationService(
      createBlocklistRepositoryMock() as never,
      createGlobalWorkspaceOrmManagerMock() as never,
    );

    await expect(
      service.validateSchema([
        {
          handle: 'not-an-email',
          description: 'Description should not weaken validation',
          workspaceMemberId: 'workspace-member-id',
          id: 'blocklist-id',
          createdAt: '2026-03-23T00:00:00.000Z',
          updatedAt: '2026-03-23T00:00:00.000Z',
        },
      ]),
    ).rejects.toThrow();
  });

  it('should reject duplicate handle on create when description is present', async () => {
    const blocklistRepository = createBlocklistRepositoryMock();
    const workspaceMemberRepository = {
      findOneByOrFail: jest.fn().mockResolvedValue({
        id: 'workspace-member-id',
      }),
    };
    const globalWorkspaceOrmManager = createGlobalWorkspaceOrmManagerMock();
    const service = new BlocklistValidationService(
      blocklistRepository as never,
      globalWorkspaceOrmManager as never,
    );
    const payload = {
      data: [
        {
          handle: 'person@example.com',
          description: 'Duplicate should still fail',
          workspaceMemberId: 'workspace-member-id',
          id: 'blocklist-id',
          createdAt: '2026-03-23T00:00:00.000Z',
          updatedAt: '2026-03-23T00:00:00.000Z',
        },
      ],
    };

    globalWorkspaceOrmManager.executeInWorkspaceContext.mockImplementation(
      async (callback: () => Promise<unknown>) => callback(),
    );
    globalWorkspaceOrmManager.getRepository.mockResolvedValue(
      workspaceMemberRepository,
    );
    blocklistRepository.getByWorkspaceMemberId.mockResolvedValue([
      {
        id: 'existing-blocklist-id',
        handle: 'person@example.com',
      },
    ]);

    await expect(
      service.validateBlocklistForCreateMany(
        payload,
        'user-id',
        'workspace-id',
      ),
    ).rejects.toThrow('Blocklist handle already exists');
  });

  it('should reject empty update handle when description is present', async () => {
    const blocklistRepository = createBlocklistRepositoryMock();
    const globalWorkspaceOrmManager = createGlobalWorkspaceOrmManagerMock();
    const service = new BlocklistValidationService(
      blocklistRepository as never,
      globalWorkspaceOrmManager as never,
    );

    blocklistRepository.getById.mockResolvedValue({
      id: 'blocklist-id',
      handle: 'person@example.com',
      description: null,
      workspaceMemberId: 'workspace-member-id',
      createdAt: '2026-03-23T00:00:00.000Z',
      updatedAt: '2026-03-23T00:00:00.000Z',
    });
    globalWorkspaceOrmManager.executeInWorkspaceContext.mockImplementation(
      async (callback: () => Promise<unknown>) => callback(),
    );
    globalWorkspaceOrmManager.getRepository.mockResolvedValue({
      findOneByOrFail: jest.fn().mockResolvedValue({
        id: 'workspace-member-id',
      }),
    });
    blocklistRepository.getByWorkspaceMemberId.mockResolvedValue([]);

    await expect(
      service.validateBlocklistForUpdateOne(
        {
          id: 'blocklist-id',
          data: {
            handle: '',
            description: 'Description should not bypass handle validation',
          },
        } as never,
        'user-id',
        'workspace-id',
      ),
    ).rejects.toThrow('Blocklist handle is required');
  });
});
