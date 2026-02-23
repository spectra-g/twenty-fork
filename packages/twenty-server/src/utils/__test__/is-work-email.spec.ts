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
  // Case-insensitive tests for consumer domains
  it('should return false for uppercase domain GMAIL.COM', () => {
    expect(isWorkDomain('GMAIL.COM')).toBe(false);
  });

  it('should return false for mixed case domain Gmail.com', () => {
    expect(isWorkDomain('Gmail.com')).toBe(false);
  });

  it('should return false for uppercase domain YAHOO.COM', () => {
    expect(isWorkDomain('YAHOO.COM')).toBe(false);
  });

  it('should return false for mixed case domain Outlook.Com', () => {
    expect(isWorkDomain('Outlook.Com')).toBe(false);
  });

  it('should return false for lowercase consumer domains', () => {
    expect(isWorkDomain('gmail.com')).toBe(false);
    expect(isWorkDomain('yahoo.com')).toBe(false);
    expect(isWorkDomain('outlook.com')).toBe(false);
  });

  // Case-insensitive tests for work domains
  it('should return true for work domain with mixed case ExampleCorp.COM', () => {
    expect(isWorkDomain('ExampleCorp.COM')).toBe(true);
  });

  it('should return true for work domain with uppercase COMPANY.COM', () => {
    expect(isWorkDomain('COMPANY.COM')).toBe(true);
  });

  it('should return true for lowercase work domains', () => {
    expect(isWorkDomain('company.com')).toBe(true);
    expect(isWorkDomain('examplecorp.com')).toBe(true);
  });

  // Edge cases
  it('should not mutate the original input', () => {
    const domain = 'GMAIL.COM';
    isWorkDomain(domain);
    expect(domain).toBe('GMAIL.COM');
  });
});
