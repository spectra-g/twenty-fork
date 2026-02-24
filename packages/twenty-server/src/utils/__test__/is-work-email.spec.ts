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

  it('should handle mixed-case local part and domain consistently', () => {
    expect(isWorkEmail('User@GMAIL.COM')).toBe(isWorkEmail('user@gmail.com'));
  });
});

describe('isWorkDomain', () => {
  it('should return the same result for uppercase and lowercase personal domains', () => {
    expect(isWorkDomain('GMAIL.COM')).toBe(isWorkDomain('gmail.com'));
  });

  it('should return the same result for mixed-case and lowercase personal domains', () => {
    expect(isWorkDomain('Gmail.Com')).toBe(isWorkDomain('gmail.com'));
  });

  it('should identify uppercase work domains as work domains', () => {
    expect(isWorkDomain('COMPANY.COM')).toBe(true);
  });

  it('should identify mixed-case work domains as work domains', () => {
    expect(isWorkDomain('Company.Com')).toBe(true);
  });

  it('should preserve lowercase behavior', () => {
    expect(isWorkDomain('gmail.com')).toBe(false);
  });
});
