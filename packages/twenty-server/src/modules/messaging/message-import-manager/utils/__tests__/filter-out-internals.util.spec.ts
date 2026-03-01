import { MessageParticipantRole } from 'twenty-shared/types';

import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { filterOutInternals } from 'src/modules/messaging/message-import-manager/utils/filter-out-internals.util';

describe('filterOutInternals', () => {
  const internalMessage: MessageWithParticipants = {
    externalId: 'internal-message',
    subject: 'Internal message',
    receivedAt: new Date('2025-01-09T09:54:37.000Z'),
    text: 'Only internal participants',
    headerMessageId: '<internal@company.com>',
    messageThreadExternalId: 'thread-1',
    direction: MessageDirection.INCOMING,
    participants: [
      {
        role: MessageParticipantRole.FROM,
        handle: 'sender@internal.company.com',
        displayName: 'Sender',
      },
      {
        role: MessageParticipantRole.TO,
        handle: 'recipient@internal.company.com',
        displayName: 'Recipient',
      },
    ],
    attachments: [],
  };

  it('filters uppercase domain emails when primary handle domain is lowercase', () => {
    const result = filterOutInternals('user@internal.company.com', [
      {
        ...internalMessage,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'sender@INTERNAL.COMPANY.COM',
            displayName: 'Sender',
          },
        ],
      },
    ]);

    expect(result).toEqual([]);
  });

  it('filters lowercase domain emails', () => {
    const result = filterOutInternals('user@internal.company.com', [
      internalMessage,
    ]);

    expect(result).toEqual([]);
  });

  it('filters mixed case domain emails', () => {
    const result = filterOutInternals('user@internal.company.com', [
      {
        ...internalMessage,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'sender@Internal.Company.COM',
            displayName: 'Sender',
          },
        ],
      },
    ]);

    expect(result).toEqual([]);
  });
});
