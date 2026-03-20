import { Test, type TestingModule } from '@nestjs/testing';

import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { BlocklistItemDeleteMessagesJob } from 'src/modules/messaging/blocklist-manager/jobs/messaging-blocklist-item-delete-messages.job';
import { MessagingBlocklistListener } from 'src/modules/messaging/blocklist-manager/listeners/messaging-blocklist.listener';
import { BlocklistReimportMessagesJob } from 'src/modules/messaging/blocklist-manager/jobs/messaging-blocklist-reimport-messages.job';

const createFlatObjectMetadata = (): FlatObjectMetadata =>
  ({
    id: 'blocklist-object-metadata-id',
    workspaceId: 'workspace-id',
    nameSingular: 'blocklist',
    namePlural: 'blocklists',
    labelSingular: 'Blocklist',
    labelPlural: 'Blocklists',
    description: 'Blocklist metadata',
    targetTableName: 'blocklist',
    isSystem: false,
    isCustom: false,
    isActive: true,
    isRemote: false,
    isAuditLogged: true,
    isSearchable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: 'IconBan',
    universalIdentifier: 'blocklist',
    fieldIds: [],
    indexMetadataIds: [],
    viewIds: [],
    applicationId: null,
    labelIdentifierFieldMetadataUniversalIdentifier: null,
    imageIdentifierFieldMetadataUniversalIdentifier: null,
  }) as FlatObjectMetadata;

const createUpdatedPayload = ({
  updatedFields,
  before,
  after,
}: {
  updatedFields: string[];
  before: BlocklistWorkspaceEntity;
  after: BlocklistWorkspaceEntity;
}): WorkspaceEventBatch<ObjectRecordUpdateEvent<BlocklistWorkspaceEntity>> => ({
  name: 'blocklist.updated',
  workspaceId: 'workspace-id',
  objectMetadata: createFlatObjectMetadata(),
  events: [
    {
      recordId: 'blocklist-id',
      properties: {
        updatedFields,
        before,
        after,
        diff: {
          description:
            before.description !== after.description
              ? {
                  before: before.description,
                  after: after.description,
                }
              : undefined,
          handle:
            before.handle !== after.handle
              ? {
                  before: before.handle,
                  after: after.handle,
                }
              : undefined,
        },
      },
    },
  ],
});

describe('MessagingBlocklistListener', () => {
  let listener: MessagingBlocklistListener;
  let messageQueueService: jest.Mocked<MessageQueueService>;

  beforeEach(async () => {
    messageQueueService = {
      add: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<MessageQueueService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingBlocklistListener,
        {
          provide: getQueueToken(MessageQueue.messagingQueue),
          useValue: messageQueueService,
        },
      ],
    }).compile();

    listener = await module.resolve(MessagingBlocklistListener);
  });

  it('should not enqueue jobs when only description changed', async () => {
    const payload = createUpdatedPayload({
      updatedFields: ['description'],
      before: {
        handle: 'person@example.com',
        description: 'Initial description',
      } as BlocklistWorkspaceEntity,
      after: {
        handle: 'person@example.com',
        description: 'Updated description',
      } as BlocklistWorkspaceEntity,
    });

    await listener.handleUpdatedEvent(payload);

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('should enqueue delete and reimport jobs when handle changed', async () => {
    const payload = createUpdatedPayload({
      updatedFields: ['handle', 'description'],
      before: {
        handle: 'old@example.com',
        description: 'Old description',
      } as BlocklistWorkspaceEntity,
      after: {
        handle: 'new@example.com',
        description: 'New description',
      } as BlocklistWorkspaceEntity,
    });

    await listener.handleUpdatedEvent(payload);

    expect(messageQueueService.add).toHaveBeenCalledTimes(2);
    expect(messageQueueService.add).toHaveBeenNthCalledWith(
      1,
      BlocklistItemDeleteMessagesJob.name,
      payload,
    );
    expect(messageQueueService.add).toHaveBeenNthCalledWith(
      2,
      BlocklistReimportMessagesJob.name,
      payload,
    );
  });
});
