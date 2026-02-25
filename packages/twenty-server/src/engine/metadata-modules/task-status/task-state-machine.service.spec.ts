import { BadRequestException } from '@nestjs/common';

import { TaskStateMachineService } from 'src/engine/metadata-modules/task-status/task-state-machine.service';
import { TaskStatus } from 'src/engine/metadata-modules/task-status/task-status.types';

describe('TaskStateMachineService', () => {
  let service: TaskStateMachineService;

  beforeEach(() => {
    service = new TaskStateMachineService();
  });

  it('exposes validateTransition with currentStatus and newStatus parameters', () => {
    expect(typeof service.validateTransition).toBe('function');
    expect(
      service.validateTransition(TaskStatus.TODO, TaskStatus.IN_PROGRESS),
    ).toBe(true);
  });

  it('AC-001: allows TODO to IN_PROGRESS transition', () => {
    expect(
      service.validateTransition(TaskStatus.TODO, TaskStatus.IN_PROGRESS),
    ).toBe(true);
  });

  it('AC-002: allows IN_PROGRESS to DONE transition', () => {
    expect(
      service.validateTransition(TaskStatus.IN_PROGRESS, TaskStatus.DONE),
    ).toBe(true);
  });

  it('AC-003: rejects DONE to any other status with locked message', () => {
    expect(() =>
      service.validateTransition(TaskStatus.DONE, TaskStatus.TODO),
    ).toThrow('Task is locked (DONE status cannot be modified)');
  });

  it('AC-004: rejects TODO to DONE transition', () => {
    expect(() =>
      service.validateTransition(TaskStatus.TODO, TaskStatus.DONE),
    ).toThrow(BadRequestException);
    expect(() =>
      service.validateTransition(TaskStatus.TODO, TaskStatus.DONE),
    ).toThrow('Invalid status transition');
  });

  it('AC-005: rejects IN_PROGRESS to TODO transition', () => {
    expect(() =>
      service.validateTransition(TaskStatus.IN_PROGRESS, TaskStatus.TODO),
    ).toThrow(BadRequestException);
    expect(() =>
      service.validateTransition(TaskStatus.IN_PROGRESS, TaskStatus.TODO),
    ).toThrow('Invalid status transition');
  });

  it('AC-006: rejects non-standard status transitions', () => {
    expect(() =>
      service.validateTransition(
        TaskStatus.TODO,
        'ARCHIVED' as unknown as TaskStatus,
      ),
    ).toThrow('Invalid status transition');
  });

  it('AC-007: bypasses validation for non-status updates', () => {
    expect(service.validateTransition(TaskStatus.TODO)).toBe(true);
  });
});
