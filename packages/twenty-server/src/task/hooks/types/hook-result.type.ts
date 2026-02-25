import { type TaskStatus } from 'src/task/types/task-status.type';

export interface TaskPreUpdateHookResult {
  isSuccess: boolean;
}

export interface TaskPreUpdateHookPayload {
  status: TaskStatus;
}
