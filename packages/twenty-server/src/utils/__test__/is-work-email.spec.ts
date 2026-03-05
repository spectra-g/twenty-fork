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

  it('should return false for uppercase personal domain (AC-001)', () => {
    expect(isWorkEmail('user@GMAIL.COM')).toBe(false);
  });

  it('should return false for mixed-case personal domain (AC-002)', () => {
    expect(isWorkEmail('User@Yahoo.COM')).toBe(false);
  });

  it('should return true for uppercase custom company domain (AC-003)', () => {
    expect(isWorkEmail('user@COMPANY.COM')).toBe(true);
  });
});

describe('isWorkDomain', () => {
  it('should return false for uppercase personal domain (AC-004)', () => {
    expect(isWorkDomain('GMAIL.COM')).toBe(false);
  });
});
