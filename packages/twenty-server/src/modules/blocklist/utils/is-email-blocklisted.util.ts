export const isEmailBlocklisted = (
  channelHandle: string[],
  email: string | null | undefined,
  blocklist: string[],
): boolean => {
  if (!email || channelHandle.includes(email)) {
    return false;
  }

  return blocklist.some((item) => {
    if (item.startsWith('@')) {
      const domain = email.split('@')[1]?.toLowerCase();
      const blocklistedDomain = item.slice(1).toLowerCase();

      return (
        domain === blocklistedDomain ||
        domain?.endsWith(`.${blocklistedDomain}`) === true
      );
    }

    return email === item;
  });
};
