import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TaskPreUpdateHook } from 'src/modules/task/hooks/task-pre-update.hook';
import {
  TaskStatus,
  type TaskPreUpdateHookPayload,
  type TaskPreUpdateValidationResult,
} from 'src/modules/task/types/task-status.type';

describe('TaskPreUpdateHook', () => {
  const hook = new TaskPreUpdateHook();

  const authContext = {} as AuthContext;
  const payload: TaskPreUpdateHookPayload = {
    id: 'task-id',
    data: { status: TaskStatus.IN_PROGRESS },
  };

  it('T-01 should be registered and invokable for update operations', async () => {
    const metadata = Reflect.getMetadata(
      WORKSPACE_QUERY_HOOK_METADATA,
      TaskPreUpdateHook,
    ) as { key: string; type: WorkspaceQueryHookType };
    const taskQueryHookModuleSource = readFileSync(
      join(process.cwd(), 'src/modules/task/query-hooks/task-query-hook.module.ts'),
      'utf8',
    );

    expect(taskQueryHookModuleSource).toContain(
      "import { TaskPreUpdateHook } from 'src/modules/task/hooks/task-pre-update.hook';",
    );
    expect(taskQueryHookModuleSource).toContain('TaskPreUpdateHook');
    expect(metadata).toEqual({
      key: 'task.updateOne',
      type: WorkspaceQueryHookType.PRE_HOOK,
    });

    await expect(hook.execute(authContext, 'task', payload)).resolves.toEqual(
      payload,
    );
  });

  it('T-02 should return hardcoded validation success for any payload', async () => {
    await expect(
      hook.validateStatusTransition(authContext, payload),
    ).resolves.toEqual({ success: true });

    await expect(
      hook.validateStatusTransition(authContext, {
        id: 'another-task-id',
        data: {},
      }),
    ).resolves.toEqual({ success: true });
  });

  it('T-03 should follow pre-update hook naming and structure conventions', () => {
    expect(TaskPreUpdateHook.name).toBe('TaskPreUpdateHook');
    expect(typeof hook.execute).toBe('function');
    expect(typeof hook.validateStatusTransition).toBe('function');
  });

  it('T-04 should expose TaskStatus and hook-related types safely', () => {
    const statuses = Object.values(TaskStatus);
    const validationResult: TaskPreUpdateValidationResult = { success: true };
    const typedPayload: TaskPreUpdateHookPayload = {
      id: 'task-typed',
      data: { status: TaskStatus.DONE },
    };

    expect(statuses).toEqual(['TODO', 'IN_PROGRESS', 'DONE']);
    expect(validationResult.success).toBe(true);
    expect(typedPayload.data.status).toBe(TaskStatus.DONE);
  });
});
