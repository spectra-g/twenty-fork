import { emailProvidersSet } from 'src/utils/email-providers';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

export const isWorkEmail = (email: string) => {
  try {
    const normalizedDomain = getDomainNameByEmail(email);

    return !emailProvidersSet.has(normalizedDomain);
  } catch {
    return false;
  }
};

export const isWorkDomain = (domain: string) => {
  return !emailProvidersSet.has(domain.trim().toLowerCase());
};
