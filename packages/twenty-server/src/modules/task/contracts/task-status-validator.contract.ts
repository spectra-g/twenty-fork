import { TaskStatus } from 'src/modules/task/types/task-status.enum';

export interface TaskStatusValidator {
  validateStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean;
}
