import { isValidElement } from 'react';

describe('twenty-emails workspace contract', () => {
  it('resolves the twenty-emails package from twenty-server tests', () => {
    expect(() => require('twenty-emails')).not.toThrow();
  });

  it('exposes template and renderer APIs used by backend services', () => {
    const twentyEmails = require('twenty-emails');

    expect(typeof twentyEmails.reactMarkupFromJSON).toBe('function');
    expect(typeof twentyEmails.SendEmailVerificationLinkEmail).toBe('function');

    const element = twentyEmails.SendEmailVerificationLinkEmail({
      link: 'https://example.com',
      locale: 'en',
      isEmailUpdate: false,
    });

    expect(isValidElement(element)).toBe(true);
  });

  it('renders JSON markup into an html-like wrapper element', () => {
    const twentyEmails = require('twenty-emails');

    const element = twentyEmails.reactMarkupFromJSON({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
    });

    expect(isValidElement(element)).toBe(true);
    expect(element.type).toBe('html');
  });
});
