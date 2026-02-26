import { TaskStateMachineService } from 'src/modules/task/services/task-state-machine.service';

describe('TaskStateMachineService', () => {
  describe('validateTransition', () => {
    it('should allow transition from TODO to IN_PROGRESS (AC-001)', () => {
      const service = new TaskStateMachineService();

      expect(() =>
        service.validateTransition('TODO', 'IN_PROGRESS'),
      ).not.toThrow();
    });

    it('should allow transition from IN_PROGRESS to DONE (AC-002)', () => {
      const service = new TaskStateMachineService();

      expect(() =>
        service.validateTransition('IN_PROGRESS', 'DONE'),
      ).not.toThrow();
    });

    it('should reject transition from TODO to DONE (AC-003)', () => {
      const service = new TaskStateMachineService();

      expect(() => service.validateTransition('TODO', 'DONE')).toThrow(
        'Invalid status transition: Cannot move directly from TODO to DONE',
      );
    });

    it('should reject transition from DONE to TODO (AC-004)', () => {
      const service = new TaskStateMachineService();

      expect(() => service.validateTransition('DONE', 'TODO')).toThrow(
        'Invalid status transition: Task is already completed',
      );
    });

    it('should reject transition from DONE to IN_PROGRESS (AC-004)', () => {
      const service = new TaskStateMachineService();

      expect(() => service.validateTransition('DONE', 'IN_PROGRESS')).toThrow(
        'Invalid status transition: Task is already completed',
      );
    });

    it('should reject transition from IN_PROGRESS to TODO (AC-005)', () => {
      const service = new TaskStateMachineService();

      expect(() => service.validateTransition('IN_PROGRESS', 'TODO')).toThrow(
        'Invalid status transition: Cannot revert from IN_PROGRESS to TODO',
      );
    });

    it('should allow no-op transitions for all valid statuses (AC-006)', () => {
      const service = new TaskStateMachineService();
      const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];

      statuses.forEach((status) => {
        expect(() => service.validateTransition(status, status)).not.toThrow();
      });
    });
  });
});
