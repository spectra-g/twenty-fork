import { STANDARD_OBJECTS } from '@/metadata/constants/standard-object.constant';

describe('STANDARD_OBJECTS blocklist', () => {
  it('should define a description field', () => {
    expect(STANDARD_OBJECTS.blocklist.fields.description).toEqual({
      universalIdentifier: expect.any(String),
    });
  });
});
