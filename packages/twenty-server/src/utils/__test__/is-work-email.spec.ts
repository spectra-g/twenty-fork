import { isWorkEmail } from 'src/utils/is-work-email';

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

  it('should return true for an uppercase work email', () => {
    expect(isWorkEmail('user@COMPANY.COM')).toBe(true);
  });

  it('should return true for a mixed case work email', () => {
    expect(isWorkEmail('User@Company.Com')).toBe(true);
  });

  it('should return false for an uppercase personal email', () => {
    expect(isWorkEmail('user@GMAIL.COM')).toBe(false);
  });

  it('should return false for a mixed case personal email', () => {
    expect(isWorkEmail('User@Yahoo.Com')).toBe(false);
  });

  it('should return true for a work email with uppercase subdomain', () => {
    expect(isWorkEmail('user@MAIL.COMPANY.COM')).toBe(true);
  });

  it('should return true for a work email with uppercase local part', () => {
    expect(isWorkEmail('USER@company.com')).toBe(true);
  });

  it('should return true for an all uppercase work email', () => {
    expect(isWorkEmail('USER@COMPANY.COM')).toBe(true);
  });
});
