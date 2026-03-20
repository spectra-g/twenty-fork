// E2E: requires live stack — un-skip in CI or local dev with servers running.

import { test } from '../lib/fixtures/screenshot';

test.skip(
  'AC-001: displays duplicate warning candidates before persisting a company',
  async () => {},
);

test.skip(
  'AC-002: navigates to an existing company from the duplicate warning',
  async () => {},
);

test.skip(
  'AC-003: creates immediately when no company duplicates are found',
  async () => {},
);

test.skip(
  'AC-004: shows a loading indicator while duplicate candidates are checked',
  async () => {},
);
