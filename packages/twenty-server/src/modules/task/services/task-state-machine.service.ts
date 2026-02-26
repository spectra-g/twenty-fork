import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskStateMachineService {
  validateTransition(currentStatus: string, newStatus: string): void {
    // No-op transitions are always valid.
    if (currentStatus === newStatus) {
      return;
    }

    if (currentStatus === 'DONE') {
      throw new Error('Invalid status transition: Task is already completed');
    }

    if (currentStatus === 'TODO' && newStatus === 'IN_PROGRESS') {
      return;
    }

    if (currentStatus === 'IN_PROGRESS' && newStatus === 'DONE') {
      return;
    }

    if (currentStatus === 'TODO' && newStatus === 'DONE') {
      throw new Error(
        'Invalid status transition: Cannot move directly from TODO to DONE',
      );
    }

    if (currentStatus === 'IN_PROGRESS' && newStatus === 'TODO') {
      throw new Error(
        'Invalid status transition: Cannot revert from IN_PROGRESS to TODO',
      );
    }

    throw new Error(
      `Invalid status transition: Cannot move from ${currentStatus} to ${newStatus}`,
    );
  }
}
