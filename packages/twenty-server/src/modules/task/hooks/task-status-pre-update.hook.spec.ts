import { MODULE_METADATA } from '@nestjs/common/constants';

import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

import { TaskStatusPreUpdateHook } from './task-status-pre-update.hook';

jest.mock('src/modules/task/query-hooks/task-delete-many.post-query.hook', () => ({
  TaskDeleteManyPostQueryHook: class TaskDeleteManyPostQueryHook {},
}));
jest.mock('src/modules/task/query-hooks/task-delete-one.post-query.hook', () => ({
  TaskDeleteOnePostQueryHook: class TaskDeleteOnePostQueryHook {},
}));
jest.mock(
  'src/modules/task/query-hooks/task-post-query-hook.service',
  () => ({
    TaskPostQueryHookService: class TaskPostQueryHookService {},
  }),
);
jest.mock('src/modules/task/query-hooks/task-restore-many.post-query.hook', () => ({
  TaskRestoreManyPostQueryHook: class TaskRestoreManyPostQueryHook {},
}));
jest.mock('src/modules/task/query-hooks/task-restore-one.post-query.hook', () => ({
  TaskRestoreOnePostQueryHook: class TaskRestoreOnePostQueryHook {},
}));

describe('TaskStatusPreUpdateHook', () => {
  it('should return the incoming update payload including status field', async () => {
    const hook = new TaskStatusPreUpdateHook();
    const payload = {
      id: 'task-id',
      data: {
        status: 'DONE',
      },
    };

    const result = await hook.execute({} as AuthContext, 'task', payload);

    expect(result).toBe(payload);
    expect(result.data.status).toBe('DONE');
  });

  it('should expose workspace query hook metadata following pre-query hook pattern', () => {
    const metadata = Reflect.getMetadata(
      WORKSPACE_QUERY_HOOK_METADATA,
      TaskStatusPreUpdateHook,
    );

    expect(metadata).toEqual({
      key: 'task.updateOne',
      type: WorkspaceQueryHookType.PRE_HOOK,
    });
  });

  it('should be registered in TaskQueryHookModule providers', () => {
    const { TaskQueryHookModule } = jest.requireActual(
      'src/modules/task/query-hooks/task-query-hook.module',
    );
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      TaskQueryHookModule,
    );

    expect(providers).toContain(TaskStatusPreUpdateHook);
  });
});
