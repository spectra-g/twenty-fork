import { type TaskStatus } from 'src/modules/task/domain/validators/task-status-state-machine';

export class TaskStatusChangedEvent {
  constructor(
    public readonly taskId: string,
    public readonly oldStatus: TaskStatus,
    public readonly newStatus: TaskStatus,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
