import { Test, type TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  type BlocklistItem,
  BlocklistValidationService,
} from './blocklist-validation.service';

const WORKSPACE_ID = 'workspace-id';
const USER_ID = 'user-id';
const WORKSPACE_MEMBER_ID = 'workspace-member-id';

const createBlocklistItem = (
  overrides: Partial<BlocklistItem> = {},
): BlocklistItem => ({
  id: 'blocklist-id',
  handle: 'person@example.com',
  description: null,
  workspaceMemberId: WORKSPACE_MEMBER_ID,
  createdAt: '2024-03-20T10:00:00.000Z',
  updatedAt: '2024-03-20T10:00:00.000Z',
  deletedAt: null,
  ...overrides,
});

describe('BlocklistValidationService', () => {
  let service: BlocklistValidationService;

  const mockBlocklistRepository = {
    getByWorkspaceMemberId: jest.fn(),
    getById: jest.fn(),
  };

  const mockWorkspaceMemberRepository = {
    findOneByOrFail: jest.fn(),
  };

  const mockGlobalWorkspaceOrmManager = {
    getRepository: jest.fn().mockResolvedValue(mockWorkspaceMemberRepository),
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation((handler: () => Promise<unknown>) => handler()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlocklistValidationService,
        {
          provide: 'BlocklistRepository',
          useValue: mockBlocklistRepository,
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
      ],
    }).compile();

    service = module.get<BlocklistValidationService>(
      BlocklistValidationService,
    );

    jest.clearAllMocks();

    mockWorkspaceMemberRepository.findOneByOrFail.mockResolvedValue({
      id: WORKSPACE_MEMBER_ID,
    });
    mockBlocklistRepository.getByWorkspaceMemberId.mockResolvedValue([]);
    mockBlocklistRepository.getById.mockResolvedValue(
      createBlocklistItem({
        id: 'existing-blocklist-id',
      }),
    );
  });

  it('should pass through description on create', async () => {
    const payload = {
      data: [
        createBlocklistItem({
          description: 'Allow support agents to classify why it is blocked',
        }),
      ],
    };

    await service.validateBlocklistForCreateMany(
      payload,
      USER_ID,
      WORKSPACE_ID,
    );

    expect(payload.data[0].description).toBe(
      'Allow support agents to classify why it is blocked',
    );
  });

  it('should allow null description on create', async () => {
    const blocklistWithoutDescription = createBlocklistItem({
      id: 'second-blocklist-id',
      handle: 'domain@example.com',
    });

    delete (blocklistWithoutDescription as Partial<BlocklistItem>).description;

    const payload = {
      data: [
        createBlocklistItem({
          description: null,
        }),
        blocklistWithoutDescription,
      ],
    };

    await service.validateBlocklistForCreateMany(payload, USER_ID, WORKSPACE_ID);

    expect(payload.data[0].description).toBeNull();
    expect(payload.data[1].description).toBeNull();
  });

  it('should preserve description on update alongside handle validation', async () => {
    const payload = {
      id: 'existing-blocklist-id',
      data: createBlocklistItem({
        id: 'ignored-on-update',
        handle: '@example.com',
        description: 'Updated block reason',
      }),
    };

    await service.validateBlocklistForUpdateOne(
      payload,
      USER_ID,
      WORKSPACE_ID,
    );

    expect(payload.data).toMatchObject({
      handle: '@example.com',
      description: 'Updated block reason',
    });
  });

  it('should preserve an existing description when update payload omits it', async () => {
    const payload = {
      id: 'existing-blocklist-id',
      data: {
        handle: '@new-example.com',
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      },
    };

    await service.validateBlocklistForUpdateOne(
      payload as never,
      USER_ID,
      WORKSPACE_ID,
    );

    expect(payload.data).toMatchObject({
      handle: '@new-example.com',
      workspaceMemberId: WORKSPACE_MEMBER_ID,
    });
    expect(payload.data).not.toHaveProperty('description');
  });

  it('should not interfere with handle validation errors', async () => {
    const payloadWithDescription = {
      data: [
        createBlocklistItem({
          handle: 'not-a-valid-handle',
          description: 'A description should not mask the handle error',
        }),
      ],
    };
    const payloadWithoutDescription = {
      data: [
        createBlocklistItem({
          id: 'other-blocklist-id',
          handle: 'not-a-valid-handle',
        }),
      ],
    };

    const errorWithDescription = await service
      .validateBlocklistForCreateMany(
        payloadWithDescription,
        USER_ID,
        WORKSPACE_ID,
      )
      .catch((error) => error);
    const errorWithoutDescription = await service
      .validateBlocklistForCreateMany(
        payloadWithoutDescription,
        USER_ID,
        WORKSPACE_ID,
      )
      .catch((error) => error);

    expect(errorWithDescription).toBeInstanceOf(BadRequestException);
    expect(errorWithoutDescription).toBeInstanceOf(BadRequestException);
    expect(errorWithDescription.message).toBe(errorWithoutDescription.message);
  });
});
