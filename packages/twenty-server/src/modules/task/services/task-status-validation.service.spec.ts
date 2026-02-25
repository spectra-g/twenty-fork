import { BadRequestException } from '@nestjs/common';

import {
  TaskStatus,
  TaskStatusValidationService,
} from 'src/modules/task/services/task-status-validation.service';

describe('TaskStatusValidationService', () => {
  let service: TaskStatusValidationService;

  beforeEach(() => {
    service = new TaskStatusValidationService();
  });

  it('should allow TODO to IN_PROGRESS transition', () => {
    expect(() =>
      service.validateTransition(TaskStatus.TODO, TaskStatus.IN_PROGRESS),
    ).not.toThrow();
  });

  it('should allow IN_PROGRESS to DONE transition', () => {
    expect(() =>
      service.validateTransition(TaskStatus.IN_PROGRESS, TaskStatus.DONE),
    ).not.toThrow();
  });

  it('should throw for TODO to DONE transition', () => {
    expect(() =>
      service.validateTransition(TaskStatus.TODO, TaskStatus.DONE),
    ).toThrow(
      new BadRequestException(
        'Cannot transition task status from TODO to DONE. Move task to IN_PROGRESS first.',
      ),
    );
  });

  it('should throw for IN_PROGRESS to TODO transition', () => {
    expect(() =>
      service.validateTransition(TaskStatus.IN_PROGRESS, TaskStatus.TODO),
    ).toThrow(
      new BadRequestException(
        'Cannot transition task status from IN_PROGRESS to TODO.',
      ),
    );
  });

  it('should throw for DONE to another status transition', () => {
    expect(() =>
      service.validateTransition(TaskStatus.DONE, TaskStatus.IN_PROGRESS),
    ).toThrow(
      new BadRequestException(
        'Cannot transition task status from DONE. DONE is a terminal state.',
      ),
    );
  });

  it('should allow same-status transitions as no-op', () => {
    expect(() =>
      service.validateTransition(TaskStatus.TODO, TaskStatus.TODO),
    ).not.toThrow();
    expect(() =>
      service.validateTransition(
        TaskStatus.IN_PROGRESS,
        TaskStatus.IN_PROGRESS,
      ),
    ).not.toThrow();
    expect(() =>
      service.validateTransition(TaskStatus.DONE, TaskStatus.DONE),
    ).not.toThrow();
  });
});
