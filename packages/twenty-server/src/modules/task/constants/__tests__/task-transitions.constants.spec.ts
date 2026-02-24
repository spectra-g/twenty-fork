describe('Task transitions constants', () => {
  it('should define valid forward transitions TODO->IN_PROGRESS and IN_PROGRESS->DONE', () => {
    let moduleUnderTest: Record<string, any> = {};

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      moduleUnderTest = require('src/modules/task/constants/task-transitions.constants');
    } catch {
      moduleUnderTest = {};
    }

    const transitions = moduleUnderTest.TASK_STATUS_TRANSITIONS;

    expect(transitions).toBeDefined();
    expect(transitions?.TODO).toEqual(['IN_PROGRESS']);
    expect(transitions?.IN_PROGRESS).toEqual(['DONE']);
    expect(transitions?.DONE).toEqual([]);
  });
});
