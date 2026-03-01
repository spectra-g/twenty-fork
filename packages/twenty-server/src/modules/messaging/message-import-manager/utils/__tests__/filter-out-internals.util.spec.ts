import { MessageParticipantRole } from 'twenty-shared/types';

import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { filterOutInternals } from 'src/modules/messaging/message-import-manager/utils/filter-out-internals.util';

describe('filterOutInternals', () => {
  it('should filter messages case-insensitively when domains match', () => {
    const primaryHandle = 'owner@EXAMPLE.COM';
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'internal-message',
        subject: 'Internal',
        receivedAt: new Date('2026-01-01T00:00:00.000Z'),
        text: 'Internal message',
        headerMessageId: '<internal@example.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'employee@example.com',
            displayName: 'Employee',
          },
          {
            role: MessageParticipantRole.TO,
            handle: 'teammate@Example.com',
            displayName: 'Teammate',
          },
        ],
        attachments: [],
      },
    ];

    expect(filterOutInternals(primaryHandle, messages)).toEqual([]);
  });
});
