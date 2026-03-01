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
    expect(isWorkEmail('user@')).toBe(false);
  });

  it('should return false for an invalid email format', () => {
    expect(isWorkEmail('invalid-email')).toBe(false);
  });

  it('AC-001: GMAIL.COM returns false like gmail.com', () => {
    expect(isWorkEmail('user@GMAIL.COM')).toBe(false);
  });

  it('AC-002: YAHOO.COM returns false like yahoo.com', () => {
    expect(isWorkEmail('user@YAHOO.COM')).toBe(false);
  });

  it('AC-004: Mixed-case non-work email domains are case-insensitive', () => {
    expect(isWorkEmail('user@GmAiL.CoM')).toBe(false);
    expect(isWorkEmail('user@YaHoO.CoM')).toBe(false);
  });

  it('AC-004: Uppercase work domains are identified as work emails', () => {
    expect(isWorkEmail('user@COMPANY.COM')).toBe(true);
  });
});

describe('isWorkDomain', () => {
  it('AC-003: Example.COM returns consistent result with example.com', () => {
    expect(isWorkDomain('Example.COM')).toBe(isWorkDomain('example.com'));
  });

  it('AC-004: Mixed-case domain lookup is case-insensitive', () => {
    expect(isWorkDomain('GmAiL.CoM')).toBe(isWorkDomain('gmail.com'));
    expect(isWorkDomain('YaHoO.CoM')).toBe(isWorkDomain('yahoo.com'));
    expect(isWorkDomain('CoMpAnY.CoM')).toBe(isWorkDomain('company.com'));
  });
});
