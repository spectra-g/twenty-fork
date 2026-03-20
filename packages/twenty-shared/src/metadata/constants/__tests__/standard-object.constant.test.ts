import { STANDARD_OBJECTS } from '../standard-object.constant';

describe('STANDARD_OBJECTS blocklist', () => {
  it('should define a stable universal identifier for the description field', () => {
    expect(STANDARD_OBJECTS.blocklist.fields).toHaveProperty('description');
    expect(STANDARD_OBJECTS.blocklist.fields.description).toStrictEqual({
      universalIdentifier: '20202020-1af0-4f77-8e9f-53227b3b6a4b',
    });
  });
});
