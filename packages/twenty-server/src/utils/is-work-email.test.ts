import { isWorkDomain } from 'src/utils/is-work-email';

describe('isWorkDomain', () => {
  it('returns the same result for GMAIL.COM as gmail.com', () => {
    expect(isWorkDomain('GMAIL.COM')).toEqual(isWorkDomain('gmail.com'));
  });
});
