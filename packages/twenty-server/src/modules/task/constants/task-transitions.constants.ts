import { TaskStatus } from 'src/modules/task/types/task-status.enum';

export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.DONE],
  [TaskStatus.DONE]: [],
};
