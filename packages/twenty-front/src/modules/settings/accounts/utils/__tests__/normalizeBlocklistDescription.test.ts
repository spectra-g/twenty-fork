import { normalizeBlocklistDescription } from '@/settings/accounts/utils/normalizeBlocklistDescription';

describe('normalizeBlocklistDescription', () => {
  it('should trim descriptions before saving', () => {
    expect(normalizeBlocklistDescription('  updated note  ')).toBe(
      'updated note',
    );
  });

  it('should normalize whitespace-only descriptions to null', () => {
    expect(normalizeBlocklistDescription('   ')).toBeNull();
  });
});
