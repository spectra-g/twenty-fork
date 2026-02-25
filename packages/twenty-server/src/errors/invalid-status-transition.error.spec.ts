import { InvalidStatusTransitionError } from './invalid-status-transition.error';

describe('InvalidStatusTransitionError', () => {
  it('should format message with current and attempted statuses', () => {
    const error = new InvalidStatusTransitionError('OPEN', 'CLOSED');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('InvalidStatusTransitionError');
    expect(error.currentStatus).toBe('OPEN');
    expect(error.attemptedStatus).toBe('CLOSED');
    expect(error.message).toBe('Invalid status transition: from OPEN to CLOSED');
  });
});
