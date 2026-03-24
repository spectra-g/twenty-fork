import { STANDARD_OBJECTS } from './standard-object.constant';

describe('STANDARD_OBJECTS.blocklist', () => {
  it('should register a canonical universal identifier for the description field', () => {
    expect(STANDARD_OBJECTS.blocklist.fields.description).toEqual({
      universalIdentifier: '20202020-9b1e-46ec-8787-0c1ecf8d6f9f',
    });
  });
});
