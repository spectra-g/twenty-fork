import { Injectable } from '@nestjs/common';

import { TaskStatusBadRequestException } from 'src/engine/metadata-modules/task-status/exceptions/bad-request.exception';
import {
  TASK_STATUS_TRANSITION_RULES,
  TaskStatus,
} from 'src/engine/metadata-modules/task-status/task-status.types';

@Injectable()
export class TaskStateMachineService {
  validateTransition(
    currentStatus: TaskStatus,
    newStatus?: TaskStatus,
  ): boolean {
    if (newStatus === undefined || newStatus === null) {
      return true;
    }

    if (
      !this.isValidTaskStatus(currentStatus) ||
      !this.isValidTaskStatus(newStatus)
    ) {
      throw new TaskStatusBadRequestException('Invalid status transition');
    }

    if (currentStatus === newStatus) {
      return true;
    }

    if (currentStatus === TaskStatus.DONE) {
      throw new TaskStatusBadRequestException(
        'Task is locked (DONE status cannot be modified)',
      );
    }

    const allowedTransitions = TASK_STATUS_TRANSITION_RULES[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new TaskStatusBadRequestException('Invalid status transition');
    }

    return true;
  }

  private isValidTaskStatus(value: unknown): value is TaskStatus {
    return Object.values(TaskStatus).includes(value as TaskStatus);
  }
}
