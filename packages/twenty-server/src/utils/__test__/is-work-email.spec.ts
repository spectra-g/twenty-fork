import { isWorkEmail, isWorkDomain } from 'src/utils/is-work-email';

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
  it('should return false for uppercase non-work domain (GMAIL.COM)', () => {
    expect(isWorkDomain('GMAIL.COM')).toBe(false);
  });

  it('should return false for mixed-case non-work domain (Gmail.Com)', () => {
    expect(isWorkDomain('Gmail.Com')).toBe(false);
  });

  it('should return false for lowercase non-work domain (gmail.com)', () => {
    expect(isWorkDomain('gmail.com')).toBe(false);
  });

  it('should return true for uppercase work domain (COMPANY.COM)', () => {
    expect(isWorkDomain('COMPANY.COM')).toBe(true);
  });

  it('should return true for mixed-case work domain (MyCompany.Com)', () => {
    expect(isWorkDomain('MyCompany.Com')).toBe(true);
  });

  it('should return true for lowercase work domain (company.com)', () => {
    expect(isWorkDomain('company.com')).toBe(true);
  });
});
