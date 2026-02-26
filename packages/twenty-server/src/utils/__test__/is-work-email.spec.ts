import { isWorkDomain, isWorkEmail } from 'src/utils/is-work-email';

describe('isWorkEmail', () => {
  it('should return true for a work email', () => {
    expect(isWorkEmail('user@company.com')).toBe(true);
  });

  it('should return false for a personal email', () => {
    expect(isWorkEmail('user@gmail.com')).toBe(false);
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
  it('should return same result for uppercase and lowercase personal domains', () => {
    expect(isWorkDomain('GMAIL.COM')).toBe(isWorkDomain('gmail.com'));
  });

  it('should return same result for mixed case and lowercase personal domains', () => {
    expect(isWorkDomain('Gmail.Com')).toBe(isWorkDomain('gmail.com'));
  });

  it('should normalize domain before personal-domain matching', () => {
    expect(isWorkDomain('YAHOO.COM')).toBe(false);
  });
});
