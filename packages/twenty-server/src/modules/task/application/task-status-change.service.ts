import { Injectable, Logger } from '@nestjs/common';

import { TaskStatusChangedEvent } from 'src/modules/task/domain/events/task-status-changed.event';
import { type TaskStatus } from 'src/modules/task/domain/validators/task-status-state-machine';

export type TaskWithStatus = {
  id: string;
  status: TaskStatus;
};

export abstract class TaskStatusPersistencePort {
  abstract findById(taskId: string): Promise<TaskWithStatus>;
  abstract updateStatus(
    taskId: string,
    status: TaskStatus,
  ): Promise<TaskWithStatus>;
}

export abstract class TaskStatusEventPublisherPort {
  abstract publish(event: TaskStatusChangedEvent): void | Promise<void>;
}

@Injectable()
export class TaskStatusChangeService {
  private readonly logger = new Logger(TaskStatusChangeService.name);

  constructor(
    private readonly taskStatusPersistencePort: TaskStatusPersistencePort,
    private readonly taskStatusEventPublisherPort: TaskStatusEventPublisherPort,
  ) {}

  async updateStatus(taskId: string, newStatus: TaskStatus): Promise<TaskWithStatus> {
    const currentTask = await this.taskStatusPersistencePort.findById(taskId);
    const updatedTask = await this.taskStatusPersistencePort.updateStatus(
      taskId,
      newStatus,
    );

    if (currentTask.status === newStatus) {
      return updatedTask;
    }

    try {
      await this.taskStatusEventPublisherPort.publish(
        new TaskStatusChangedEvent(taskId, currentTask.status, newStatus),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to publish task status change event for task "${taskId}"`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return updatedTask;
  }
}
