import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { isLiveStackAcceptanceEnabled } from './isLiveStackAcceptanceEnabled';

describe('isLiveStackAcceptanceEnabled', () => {
  it('returns true in CI so acceptance specs are runnable there by default', () => {
    assert.equal(
      isLiveStackAcceptanceEnabled({
        CI: 'true',
      }),
      true,
    );
  });

  it('returns true when local dev explicitly enables live-stack acceptance tests', () => {
    assert.equal(
      isLiveStackAcceptanceEnabled({
        RUN_LIVE_STACK_ACCEPTANCE: 'true',
      }),
      true,
    );
  });

  it('returns false when neither CI nor a local opt-in flag is present', () => {
    assert.equal(isLiveStackAcceptanceEnabled({}), false);
  });
});
