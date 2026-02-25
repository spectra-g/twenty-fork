import { BadRequestException } from '@nestjs/common';

import { TaskStatusSecurityService } from 'src/modules/task/services/task-status-security.service';

describe('TaskStatusSecurityService', () => {
  const service = new TaskStatusSecurityService();

  it('T-01 / AC-001: should throw BadRequestException when task status is DONE and attempting status update', () => {
    expect(() =>
      service.enforceDoneLock({ status: 'DONE' }, { status: 'IN_PROGRESS' }),
    ).toThrow(BadRequestException);

    expect(() =>
      service.enforceDoneLock({ status: 'DONE' }, { status: 'IN_PROGRESS' }),
    ).toThrow('Task is locked: DONE tasks cannot be modified');
  });

  it('T-02 / AC-002: should throw BadRequestException when task status is DONE and attempting non-status field update', () => {
    expect(() =>
      service.enforceDoneLock({ status: 'DONE' }, { title: 'Updated title' }),
    ).toThrow(BadRequestException);

    expect(() =>
      service.enforceDoneLock({ status: 'DONE' }, { title: 'Updated title' }),
    ).toThrow('Task is locked: DONE tasks cannot be modified');
  });

  it('T-03 / AC-003: should not throw when task status is TODO', () => {
    expect(() =>
      service.enforceDoneLock({ status: 'TODO' }, { title: 'Updated title' }),
    ).not.toThrow();
  });

  it('T-03 / AC-003: should not throw when task status is IN_PROGRESS', () => {
    expect(() =>
      service.enforceDoneLock(
        { status: 'IN_PROGRESS' },
        { description: 'Updated description' },
      ),
    ).not.toThrow();
  });

  it('should allow valid status transition TODO -> IN_PROGRESS', () => {
    expect(() =>
      service.enforceDoneLock({ status: 'TODO' }, { status: 'IN_PROGRESS' }),
    ).not.toThrow();
  });

  it('should throw for invalid status transition TODO -> DONE', () => {
    expect(() =>
      service.enforceDoneLock({ status: 'TODO' }, { status: 'DONE' }),
    ).toThrow(BadRequestException);

    expect(() =>
      service.enforceDoneLock({ status: 'TODO' }, { status: 'DONE' }),
    ).toThrow(
      'Invalid status transition: TODO → DONE. Allowed transitions: TODO → IN_PROGRESS',
    );
  });
});
