import { BadRequestException, Injectable } from '@nestjs/common';

interface TaskWithStatus {
  status?: string | null;
}

@Injectable()
export class TaskStatusSecurityService {
  enforceDoneLock(
    task: TaskWithStatus,
    _updateDto: Record<string, unknown>,
  ): void {
    if (task.status === 'DONE') {
      throw new BadRequestException(
        'Task is locked: DONE tasks cannot be modified',
      );
    }
  }
}
