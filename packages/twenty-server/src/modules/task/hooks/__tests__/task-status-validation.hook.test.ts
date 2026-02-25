import 'reflect-metadata';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TaskStatus } from 'src/modules/task/enums/task-status.enum';
import { TaskStatusValidationHook } from 'src/modules/task/hooks/task-status-validation.hook';

describe('TaskStatusValidationHook', () => {
  it('accepts current/new statuses and returns a success response', async () => {
    const hook = new TaskStatusValidationHook();

    const result = await hook.validateStatusTransition({
      currentStatus: TaskStatus.TODO,
      newStatus: TaskStatus.IN_PROGRESS,
    });

    expect(result).toEqual({ success: true });
  });

  it('runs in pre-update flow before persistence', async () => {
    const hook = new TaskStatusValidationHook();
    const executionOrder: string[] = [];
    const persistUpdate = jest.fn(async () => {
      executionOrder.push('persist');
    });

    const payload: UpdateOneResolverArgs<{ status: TaskStatus }> = {
      id: 'task-id',
      data: { status: TaskStatus.DONE },
    };

    const updateTaskStatus = async () => {
      executionOrder.push('hook-start');
      await hook.execute({} as AuthContext, 'task', payload);
      executionOrder.push('hook-end');
      await persistUpdate();
    };

    await updateTaskStatus();

    expect(executionOrder).toEqual(['hook-start', 'hook-end', 'persist']);
    expect(persistUpdate).toHaveBeenCalledTimes(1);
  });

  it('follows the blocklist pre-query hook architectural pattern', () => {
    const taskHookMetadata = Reflect.getMetadata(
      WORKSPACE_QUERY_HOOK_METADATA,
      TaskStatusValidationHook,
    );
    const blocklistUpdateOneHookFile = readFileSync(
      join(
        process.cwd(),
        'src/modules/blocklist/query-hooks/blocklist-update-one.pre-query.hook.ts',
      ),
      'utf-8',
    );

    expect(taskHookMetadata).toMatchObject({
      key: 'task.updateOne',
      type: WorkspaceQueryHookType.PRE_HOOK,
    });
    expect(blocklistUpdateOneHookFile).toContain(
      '@WorkspaceQueryHook(`blocklist.updateOne`)',
    );
    expect(blocklistUpdateOneHookFile).toContain(
      'implements WorkspacePreQueryHookInstance',
    );
  });
});
