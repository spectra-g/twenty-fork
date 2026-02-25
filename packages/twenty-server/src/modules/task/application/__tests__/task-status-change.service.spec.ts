import {
  TaskStatusChangeService,
  TaskStatusEventPublisherPort,
  TaskStatusPersistencePort,
} from 'src/modules/task/application/task-status-change.service';
import { TaskStatusChangedEvent } from 'src/modules/task/domain/events/task-status-changed.event';

describe('TaskStatusChangeService', () => {
  const taskId = 'task-123';

  let taskStatusPersistencePort: jest.Mocked<TaskStatusPersistencePort>;
  let taskStatusEventPublisherPort: jest.Mocked<TaskStatusEventPublisherPort>;
  let service: TaskStatusChangeService;

  beforeEach(() => {
    taskStatusPersistencePort = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    taskStatusEventPublisherPort = {
      publish: jest.fn(),
    };

    service = new TaskStatusChangeService(
      taskStatusPersistencePort,
      taskStatusEventPublisherPort,
    );
  });

  it('T-01 / AC-001: should publish TaskStatusChangedEvent for TODO -> IN_PROGRESS transition', async () => {
    taskStatusPersistencePort.findById.mockResolvedValue({
      id: taskId,
      status: 'TODO',
    });
    taskStatusPersistencePort.updateStatus.mockResolvedValue({
      id: taskId,
      status: 'IN_PROGRESS',
    });

    await service.updateStatus(taskId, 'IN_PROGRESS');

    expect(taskStatusEventPublisherPort.publish).toHaveBeenCalledTimes(1);

    const [event] = taskStatusEventPublisherPort.publish.mock.calls[0];

    expect(event).toBeInstanceOf(TaskStatusChangedEvent);
    expect(event).toEqual(
      expect.objectContaining({
        taskId,
        oldStatus: 'TODO',
        newStatus: 'IN_PROGRESS',
      }),
    );
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('T-02 / AC-002: should publish TaskStatusChangedEvent for IN_PROGRESS -> DONE transition', async () => {
    taskStatusPersistencePort.findById.mockResolvedValue({
      id: taskId,
      status: 'IN_PROGRESS',
    });
    taskStatusPersistencePort.updateStatus.mockResolvedValue({
      id: taskId,
      status: 'DONE',
    });

    await service.updateStatus(taskId, 'DONE');

    expect(taskStatusEventPublisherPort.publish).toHaveBeenCalledTimes(1);

    const [event] = taskStatusEventPublisherPort.publish.mock.calls[0];

    expect(event).toBeInstanceOf(TaskStatusChangedEvent);
    expect(event).toEqual(
      expect.objectContaining({
        taskId,
        oldStatus: 'IN_PROGRESS',
        newStatus: 'DONE',
      }),
    );
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('T-03 / AC-003: should not publish when status does not change', async () => {
    taskStatusPersistencePort.findById.mockResolvedValue({
      id: taskId,
      status: 'TODO',
    });
    taskStatusPersistencePort.updateStatus.mockResolvedValue({
      id: taskId,
      status: 'TODO',
    });

    await service.updateStatus(taskId, 'TODO');

    expect(taskStatusEventPublisherPort.publish).not.toHaveBeenCalled();
  });

  it('T-04 / AC-004: should persist update even when event publication fails', async () => {
    const updatedTask = {
      id: taskId,
      status: 'IN_PROGRESS' as const,
    };

    taskStatusPersistencePort.findById.mockResolvedValue({
      id: taskId,
      status: 'TODO',
    });
    taskStatusPersistencePort.updateStatus.mockResolvedValue(updatedTask);
    taskStatusEventPublisherPort.publish.mockImplementation(() => {
      throw new Error('Event bus unavailable');
    });

    await expect(service.updateStatus(taskId, 'IN_PROGRESS')).resolves.toEqual(
      updatedTask,
    );

    expect(taskStatusPersistencePort.updateStatus).toHaveBeenCalledWith(
      taskId,
      'IN_PROGRESS',
    );
    expect(taskStatusEventPublisherPort.publish).toHaveBeenCalledTimes(1);
  });
});
