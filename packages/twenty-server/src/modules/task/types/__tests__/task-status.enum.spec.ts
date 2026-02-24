describe('TaskStatus enum contract', () => {
  it('should expose TODO, IN_PROGRESS, and DONE values', () => {
    let moduleUnderTest: Record<string, any> = {};

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      moduleUnderTest = require('src/modules/task/types/task-status.enum');
    } catch {
      moduleUnderTest = {};
    }

    expect(moduleUnderTest.TaskStatus).toBeDefined();
    expect(moduleUnderTest.TaskStatus?.TODO).toBe('TODO');
    expect(moduleUnderTest.TaskStatus?.IN_PROGRESS).toBe('IN_PROGRESS');
    expect(moduleUnderTest.TaskStatus?.DONE).toBe('DONE');
  });
});
