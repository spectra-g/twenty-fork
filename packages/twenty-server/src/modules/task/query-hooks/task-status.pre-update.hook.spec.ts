import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { TaskStatusPreUpdateHook } from 'src/modules/task/query-hooks/task-status.pre-update.hook';

describe('TaskStatusPreUpdateHook', () => {
  it('should be registered with task query hook module providers', () => {
    const taskQueryHookModuleFile = readFileSync(
      join(__dirname, 'task-query-hook.module.ts'),
      'utf-8',
    );

    expect(taskQueryHookModuleFile).toContain('TaskStatusPreUpdateHook');
    expect(taskQueryHookModuleFile).toContain(
      "import { TaskStatusPreUpdateHook } from 'src/modules/task/query-hooks/task-status.pre-update.hook';",
    );
  });

  it('should be registered as task.updateOne pre-query hook', () => {
    const hookMetadata = Reflect.getMetadata(
      WORKSPACE_QUERY_HOOK_METADATA,
      TaskStatusPreUpdateHook,
    );

    expect(hookMetadata).toEqual(
      expect.objectContaining({
        key: 'task.updateOne',
        type: WorkspaceQueryHookType.PRE_HOOK,
      }),
    );
  });

  it('should return hardcoded success in handle', async () => {
    const hook = new TaskStatusPreUpdateHook();

    await expect(hook.handle()).resolves.toEqual({ success: true });
  });
});
