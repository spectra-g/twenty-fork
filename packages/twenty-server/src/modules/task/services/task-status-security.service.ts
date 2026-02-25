import { BadRequestException, Injectable } from '@nestjs/common';

import { validateStatusTransitionIfUpdated } from 'src/modules/task/domain/validators/task-status-state-machine';

interface TaskWithStatus {
  status?: string | null;
}

@Injectable()
export class TaskStatusSecurityService {
  enforceDoneLock(
    task: TaskWithStatus,
    updateDto: Record<string, unknown>,
  ): void {
    if (task.status === 'DONE') {
      throw new BadRequestException(
        'Task is locked: DONE tasks cannot be modified',
      );
    }

    validateStatusTransitionIfUpdated(task.status, updateDto);
  }
}
