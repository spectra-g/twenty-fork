import { emailProvidersSet } from 'src/utils/email-providers';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

const normalizedEmailProvidersSet = new Set(
  Array.from(emailProvidersSet, (provider) => provider.toLowerCase()),
);

export const isWorkEmail = (email: string) => {
  try {
    return isWorkDomain(getDomainNameByEmail(email));
  } catch {
    return false;
  }
};

export const isWorkDomain = (domain: string) => {
  return !normalizedEmailProvidersSet.has(domain.toLowerCase());
};
