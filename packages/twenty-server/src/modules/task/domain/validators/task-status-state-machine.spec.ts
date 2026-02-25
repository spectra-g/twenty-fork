import { BadRequestException } from '@nestjs/common';

import * as TaskStatusStateMachine from 'src/modules/task/domain/validators/task-status-state-machine';

describe('TaskStatusStateMachine', () => {
  it('T-01 / AC-001: should allow TODO -> IN_PROGRESS transition', () => {
    const result = TaskStatusStateMachine.validateStatusTransition(
      'TODO',
      'IN_PROGRESS',
    );

    expect(result).toBe(true);
  });

  it('T-02 / AC-002: should allow IN_PROGRESS -> DONE transition', () => {
    const result = TaskStatusStateMachine.validateStatusTransition(
      'IN_PROGRESS',
      'DONE',
    );

    expect(result).toBe(true);
  });

  it('T-03 / AC-003: should throw for TODO -> DONE with exact error message', () => {
    expect(() =>
      TaskStatusStateMachine.validateStatusTransition('TODO', 'DONE'),
    ).toThrow(BadRequestException);

    expect(() =>
      TaskStatusStateMachine.validateStatusTransition('TODO', 'DONE'),
    ).toThrow(
      'Invalid status transition: TODO → DONE. Allowed transitions: TODO → IN_PROGRESS',
    );
  });

  it('T-04 / AC-003: should throw for DONE -> TODO transition', () => {
    expect(() =>
      TaskStatusStateMachine.validateStatusTransition('DONE', 'TODO'),
    ).toThrow(BadRequestException);
  });

  it('T-05 / AC-004: should bypass transition validation when status is not updated', () => {
    const spy = jest.spyOn(TaskStatusStateMachine, 'validateStatusTransition');

    TaskStatusStateMachine.validateStatusTransitionIfUpdated('TODO', {
      title: 'Updated title',
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it('T-06 / AC-005: should validate transitions in less than 5ms on average', () => {
    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i += 1) {
      TaskStatusStateMachine.validateStatusTransition('TODO', 'IN_PROGRESS');
    }

    const averageTimeInMs = (performance.now() - start) / iterations;

    expect(averageTimeInMs).toBeLessThan(5);
  });
});
