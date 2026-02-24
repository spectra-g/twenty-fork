import { isWorkDomain } from 'src/utils/is-work-email';

describe('isWorkDomain', () => {
  it('should return true for an uppercase work domain', () => {
    expect(isWorkDomain('COMPANY.COM')).toBe(true);
  });

  it('should return true for a lowercase work domain', () => {
    expect(isWorkDomain('company.com')).toBe(true);
  });

  it('should return true for a mixed case work domain', () => {
    expect(isWorkDomain('Company.Com')).toBe(true);
  });

  it('should return false for an uppercase personal domain', () => {
    expect(isWorkDomain('GMAIL.COM')).toBe(false);
  });

  it('should return false for a mixed case personal domain', () => {
    expect(isWorkDomain('Yahoo.Com')).toBe(false);
  });

  it('should return true for a work domain with uppercase subdomain', () => {
    expect(isWorkDomain('MAIL.COMPANY.COM')).toBe(true);
  });

  it('should return true for a work domain with mixed case subdomain', () => {
    expect(isWorkDomain('Mail.Company.Com')).toBe(true);
  });
});
