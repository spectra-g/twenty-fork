import { BadRequestException } from '@nestjs/common';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['DONE'],
  DONE: [],
};

const isTaskStatus = (value: string): value is TaskStatus =>
  Object.prototype.hasOwnProperty.call(TASK_STATUS_TRANSITIONS, value);

export const validateStatusTransition = (
  current: string,
  next: string,
): true => {
  if (current === next) {
    return true;
  }

  if (!isTaskStatus(current) || !isTaskStatus(next)) {
    throw new BadRequestException(
      `Invalid status transition: ${current} → ${next}. Allowed transitions: none`,
    );
  }

  const allowedNextStatuses = TASK_STATUS_TRANSITIONS[current];

  if (allowedNextStatuses.includes(next)) {
    return true;
  }

  const allowedTransitions =
    allowedNextStatuses.length > 0
      ? allowedNextStatuses.map((status) => `${current} → ${status}`).join(', ')
      : 'none';

  throw new BadRequestException(
    `Invalid status transition: ${current} → ${next}. Allowed transitions: ${allowedTransitions}`,
  );
};

export const validateStatusTransitionIfUpdated = (
  current: string | null | undefined,
  updateDto: Record<string, unknown>,
): void => {
  const next = updateDto.status;

  if (typeof next !== 'string' || typeof current !== 'string') {
    return;
  }

  validateStatusTransition(current, next);
};
