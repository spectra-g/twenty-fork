import { TaskStatus } from 'src/modules/task/enums/task-status.enum';
import { BadRequestException } from 'src/modules/task/exceptions/bad-request.exception';

import { validateTransition } from './task-status-machine';

describe('task-status-machine', () => {
  it('T-01 / AC-001 validates TODO → IN_PROGRESS transition succeeds', () => {
    expect(() =>
      validateTransition(TaskStatus.TODO, TaskStatus.IN_PROGRESS),
    ).not.toThrow();
  });

  it('T-02 / AC-002 validates IN_PROGRESS → DONE transition succeeds', () => {
    expect(() =>
      validateTransition(TaskStatus.IN_PROGRESS, TaskStatus.DONE),
    ).not.toThrow();
  });

  it('T-03 / AC-003 validates TODO → DONE throws BadRequestException with correct message', () => {
    expect(() => validateTransition(TaskStatus.TODO, TaskStatus.DONE)).toThrow(
      new BadRequestException('Invalid status transition: TODO → DONE'),
    );
  });

  it('T-04 / AC-004 validates DONE → IN_PROGRESS throws exception with locked message', () => {
    expect(() =>
      validateTransition(TaskStatus.DONE, TaskStatus.IN_PROGRESS),
    ).toThrow(
      new BadRequestException(
        'Invalid status transition: DONE → IN_PROGRESS. Task is locked in DONE state',
      ),
    );
  });

  it('T-05 / AC-004 validates DONE → TODO throws exception with locked message', () => {
    expect(() => validateTransition(TaskStatus.DONE, TaskStatus.TODO)).toThrow(
      new BadRequestException(
        'Invalid status transition: DONE → TODO. Task is locked in DONE state',
      ),
    );
  });

  it('T-06 / AC-005 validates IN_PROGRESS → TODO throws BadRequestException', () => {
    expect(() =>
      validateTransition(TaskStatus.IN_PROGRESS, TaskStatus.TODO),
    ).toThrow(new BadRequestException('Invalid status transition: IN_PROGRESS → TODO'));
  });
});
