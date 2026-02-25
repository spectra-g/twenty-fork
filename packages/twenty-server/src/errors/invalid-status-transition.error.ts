export class InvalidStatusTransitionError extends Error {
  constructor(
    readonly currentStatus: string,
    readonly attemptedStatus: string,
  ) {
    super(
      `Invalid status transition: from ${currentStatus} to ${attemptedStatus}`,
    );
    this.name = 'InvalidStatusTransitionError';
  }
}
