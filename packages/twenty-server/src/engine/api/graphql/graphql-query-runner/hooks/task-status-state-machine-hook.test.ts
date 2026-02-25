import fs from 'node:fs';
import path from 'node:path';

import {
  TaskStatusStateMachineHook,
  type TaskUpdateRequest,
} from 'src/engine/api/graphql/graphql-query-runner/hooks';

describe('TaskStatusStateMachineHook', () => {
  it('implements a hook skeleton that can be registered and intercept task update requests', () => {
    const hook = new TaskStatusStateMachineHook();

    const request: TaskUpdateRequest = {
      objectName: 'task',
      operation: 'updateOne',
      payload: {
        id: 'task-id',
        status: 'IN_PROGRESS',
      },
    };

    expect(hook).toBeInstanceOf(TaskStatusStateMachineHook);
    expect(typeof hook.preUpdate).toBe('function');
    expect(hook.preUpdate(request)).toEqual({
      success: true,
      intercepted: true,
    });

    const hookPath = path.join(
      __dirname,
      'task-status-state-machine-hook.ts',
    );

    expect(fs.existsSync(hookPath)).toBe(true);
    expect(TaskStatusStateMachineHook.name).toBe('TaskStatusStateMachineHook');
  });
});
