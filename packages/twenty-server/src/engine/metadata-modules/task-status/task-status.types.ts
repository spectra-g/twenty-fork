export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export type TaskStatusTransitionRules = Record<TaskStatus, TaskStatus[]>;

export const TASK_STATUS_TRANSITION_RULES: TaskStatusTransitionRules = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.DONE],
  [TaskStatus.DONE]: [],
};
