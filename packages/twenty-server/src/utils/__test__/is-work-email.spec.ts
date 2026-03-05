import { isWorkDomain, isWorkEmail } from 'src/utils/is-work-email';

describe('isWorkEmail', () => {
  it('should return true for a work email', () => {
    expect(isWorkEmail('user@company.com')).toBe(true);
  });

  it('should return false for a personal email', () => {
    expect(isWorkEmail('user@gmail.com')).toBe(false);
  });

  it('should return false for a mixed-case personal email', () => {
    expect(isWorkEmail('user@Gmail.COM')).toBe(false);
    expect(isWorkEmail('user@GMAIL.com')).toBe(false);
  });

  it('should return true for a mixed-case work email domain', () => {
    expect(isWorkEmail('user@Company.COM')).toBe(true);
  });

  it('should return false for an empty email string', () => {
    expect(isWorkEmail('')).toBe(false);
  });

  it('should return false for an email with undefined domain', () => {
    // Assuming getDomainNameByEmail(email) returns undefined if no domain.
    expect(isWorkEmail('user@')).toBe(false);
  });

  it('should return false for an invalid email format', () => {
    expect(isWorkEmail('invalid-email')).toBe(false);
  });
});

describe('isWorkDomain', () => {
  it('should classify mixed-case personal provider domains as non-work', () => {
    expect(isWorkDomain('GMAIL.com')).toBe(false);
  });

  it('should classify mixed-case work domains as work', () => {
    expect(isWorkDomain('EXAMPLE-WORK-DOMAIN.COM')).toBe(true);
  });

  it('should classify using case-insensitive matching even with mixed-case provider set entries', () => {
    jest.resetModules();
    jest.doMock('src/utils/email-providers', () => ({
      emailProvidersSet: new Set(['Example.COM']),
    }));

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        isWorkDomain: mockedIsWorkDomain,
        isWorkEmail: mockedIsWorkEmail,
      } = require('src/utils/is-work-email');

      expect(mockedIsWorkDomain('EXAMPLE.com')).toBe(false);
      expect(mockedIsWorkEmail('user@EXAMPLE.com')).toBe(false);
    });

    jest.dontMock('src/utils/email-providers');
  });
});
