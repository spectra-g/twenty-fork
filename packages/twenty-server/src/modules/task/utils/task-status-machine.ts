import { TaskStatus } from 'src/modules/task/enums/task-status.enum';
import { BadRequestException } from 'src/modules/task/exceptions/bad-request.exception';

type TransitionMap = Record<TaskStatus, TaskStatus[]>;

const ALLOWED_TRANSITIONS: TransitionMap = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.DONE],
  [TaskStatus.DONE]: [],
};

export const validateTransition = (
  currentStatus: TaskStatus | null | undefined,
  targetStatus: TaskStatus,
): void => {
  if (currentStatus === targetStatus) {
    return;
  }

  const currentStatusLabel = currentStatus ?? 'UNKNOWN';

  if (currentStatus === TaskStatus.DONE) {
    throw new BadRequestException(
      `Invalid status transition: ${currentStatusLabel} → ${targetStatus}. Task is locked in DONE state`,
    );
  }

  if (!currentStatus || !ALLOWED_TRANSITIONS[currentStatus].includes(targetStatus)) {
    throw new BadRequestException(
      `Invalid status transition: ${currentStatusLabel} → ${targetStatus}`,
    );
  }
};
