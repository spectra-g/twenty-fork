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
  it('should return false for uppercase GMAIL.COM (non-work domain)', () => {
    expect(isWorkDomain('GMAIL.COM')).toBe(false);
  });

  it('should return false for mixed case GmAiL.cOm (non-work domain)', () => {
    expect(isWorkDomain('GmAiL.cOm')).toBe(false);
  });

  it('should return true for lowercase gmail.com (non-work domain)', () => {
    expect(isWorkDomain('gmail.com')).toBe(false);
  });

  it('should return true for uppercase COMPANY.COM (work domain)', () => {
    expect(isWorkDomain('COMPANY.COM')).toBe(true);
  });

  it('should return true for mixed case CoMpAnY.cOm (work domain)', () => {
    expect(isWorkDomain('CoMpAnY.cOm')).toBe(true);
  });

  it('should return true for lowercase company.com (work domain)', () => {
    expect(isWorkDomain('company.com')).toBe(true);
  });
});
