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
  it('should return false for uppercase personal domain GMAIL.COM', () => {
    expect(isWorkDomain('GMAIL.COM')).toBe(false);
  });

  it('should return false for mixed-case personal domain Yahoo.COM', () => {
    expect(isWorkDomain('Yahoo.COM')).toBe(false);
  });

  it('should return true for mixed-case work domain Company.COM', () => {
    expect(isWorkDomain('Company.COM')).toBe(true);
  });
});
