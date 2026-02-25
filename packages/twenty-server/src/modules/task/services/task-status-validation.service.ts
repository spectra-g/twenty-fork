import { BadRequestException, Injectable } from '@nestjs/common';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Injectable()
export class TaskStatusValidationService {
  private readonly validTransitions: Record<TaskStatus, Set<TaskStatus>> = {
    [TaskStatus.TODO]: new Set([TaskStatus.IN_PROGRESS]),
    [TaskStatus.IN_PROGRESS]: new Set([TaskStatus.DONE]),
    [TaskStatus.DONE]: new Set(),
  };

  validateTransition(currentStatus: TaskStatus, newStatus: TaskStatus): void {
    if (currentStatus === newStatus) {
      return;
    }

    if (currentStatus === TaskStatus.DONE) {
      throw new BadRequestException(
        'Cannot transition task status from DONE. DONE is a terminal state.',
      );
    }

    if (this.validTransitions[currentStatus].has(newStatus)) {
      return;
    }

    if (
      currentStatus === TaskStatus.TODO &&
      newStatus === TaskStatus.DONE
    ) {
      throw new BadRequestException(
        'Cannot transition task status from TODO to DONE. Move task to IN_PROGRESS first.',
      );
    }

    if (
      currentStatus === TaskStatus.IN_PROGRESS &&
      newStatus === TaskStatus.TODO
    ) {
      throw new BadRequestException(
        'Cannot transition task status from IN_PROGRESS to TODO.',
      );
    }

    throw new BadRequestException(
      `Invalid task status transition from ${currentStatus} to ${newStatus}.`,
    );
  }
}
