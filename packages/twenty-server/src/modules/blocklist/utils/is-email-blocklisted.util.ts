export const isEmailBlocklisted = (
  channelHandle: string[],
  email: string | null | undefined,
  blocklist: string[],
): boolean => {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.toLowerCase();

  if (channelHandle.map((handle) => handle.toLowerCase()).includes(normalizedEmail)) {
    return false;
  }

  const domain = normalizedEmail.split('@')[1];

  return blocklist.some((item) => {
    const normalizedItem = item.toLowerCase();

    if (normalizedItem.startsWith('@')) {
      const blocklistedDomain = normalizedItem.slice(1);

      return (
        domain === blocklistedDomain ||
        (!!domain && domain.endsWith(`.${blocklistedDomain}`))
      );
    }

    if (normalizedItem.includes('@')) {
      return normalizedEmail === normalizedItem;
    }

    return (
      domain === normalizedItem || (!!domain && domain.endsWith(`.${normalizedItem}`))
    );
  });
};
