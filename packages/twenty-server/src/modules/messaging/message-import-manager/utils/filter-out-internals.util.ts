import { isDefined } from 'twenty-shared/utils';

import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

export const filterOutInternals = (
  primaryHandle: string,
  messages: MessageWithParticipants[],
) => {
  return messages.filter((message) => {
    if (!message.participants) {
      return true;
    }

    const primaryHandleDomain = getDomainNameByEmail(primaryHandle);
    const normalizedPrimaryHandleDomain = primaryHandleDomain.toLowerCase();

    try {
      const isAllHandlesFromSameDomain = message.participants
        .filter((participant) => isDefined(participant.handle))
        .every(
          (participant) =>
            isDefined(participant.handle) &&
            getDomainNameByEmail(participant.handle).toLowerCase() ===
              normalizedPrimaryHandleDomain,
        );

      if (isAllHandlesFromSameDomain) {
        return false;
      }
    } catch {
      return true;
    }

    return true;
  });
};
