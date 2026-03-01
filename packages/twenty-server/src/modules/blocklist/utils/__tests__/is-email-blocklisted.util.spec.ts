import { isEmailBlocklisted } from 'src/modules/blocklist/utils/is-email-blocklisted.util';

describe('isEmailBlocklisted', () => {
  it('should return true if email is blocklisted', () => {
    const channelHandles = ['abc@example.com'];
    const email = 'hello@twenty.com';
    const blocklist = ['hello@twenty.com', 'hey@twenty.com'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(true);
  });
  it('should return false if email is not blocklisted', () => {
    const channelHandles = ['abc@example.com'];
    const email = 'hello@twenty.com';
    const blocklist = ['hey@example.com'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(false);
  });
  it('should return false if email is null', () => {
    const channelHandles = ['abc@twenty.com'];
    const email = null;
    const blocklist = ['@example.com'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(false);
  });
  it('should return true for subdomains', () => {
    const channelHandles = ['abc@example.com'];
    const email = 'hello@twenty.twenty.com';
    const blocklist = ['@twenty.com'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(true);
  });
  it('should return false for domains which end with blocklisted domain but are not subdomains', () => {
    const channelHandles = ['abc@example.com'];
    const email = 'hello@twentytwenty.com';
    const blocklist = ['@twenty.com'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(false);
  });
  it('should return false if email is undefined', () => {
    const channelHandles = ['abc@example.com'];
    const email = undefined;
    const blocklist = ['@twenty.com'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(false);
  });
  it('should return true if email ends with blocklisted domain', () => {
    const channelHandles = ['abc@example.com'];
    const email = 'hello@twenty.com';
    const blocklist = ['@twenty.com'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(true);
  });

  it('should return false if email is same as channel handle', () => {
    const channelHandles = ['hello@twenty.com'];
    const email = 'hello@twenty.com';
    const blocklist = ['@twenty.com'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(false);
  });

  it('should return true for case-insensitive base domain match (@spam.COM vs user@SPAM.com)', () => {
    const channelHandles = ['abc@example.com'];
    const email = 'user@SPAM.com';
    const blocklist = ['@spam.COM'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(true);
  });

  it('should return true for reverse case-insensitive base domain match (@SPAM.COM vs user@spam.com)', () => {
    const channelHandles = ['abc@example.com'];
    const email = 'user@spam.com';
    const blocklist = ['@SPAM.COM'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(true);
  });

  it('should return true for case-insensitive subdomain match (@spam.COM vs user@sub.Spam.COM)', () => {
    const channelHandles = ['abc@example.com'];
    const email = 'user@sub.Spam.COM';
    const blocklist = ['@spam.COM'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(true);
  });

  it('should return true for case-insensitive nested subdomain match (@Spam.Com vs user@mailer.sub.spam.com)', () => {
    const channelHandles = ['abc@example.com'];
    const email = 'user@mailer.sub.spam.com';
    const blocklist = ['@Spam.Com'];
    const result = isEmailBlocklisted(channelHandles, email, blocklist);

    expect(result).toBe(true);
  });
});
