import { MODULE_METADATA } from '@nestjs/common/constants';

import { type WorkspaceQueryHookOptions } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-one.pre-query.hook';
import { TaskPreUpdateHook } from 'src/modules/task/hooks/task-pre-update.hook';
import { TaskQueryHookModule } from 'src/modules/task/query-hooks/task-query-hook.module';
import { type TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

describe('TaskPreUpdateHook', () => {
  it('should be registered in task module and execute before task updates', async () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      TaskQueryHookModule,
    ) as unknown[] | undefined;

    expect(providers).toContain(TaskPreUpdateHook);

    const hook = new TaskPreUpdateHook();
    const payload: UpdateOneResolverArgs<Partial<TaskWorkspaceEntity>> = {
      id: 'task-id',
      data: { status: 'DONE', title: 'Updated title' },
    };
    const authContext = {} as AuthContext;

    await expect(hook.execute(authContext, 'task', payload)).resolves.toEqual(
      payload,
    );
  });

  it('should allow all updates in stub mode', async () => {
    const hook = new TaskPreUpdateHook();
    const payload: UpdateOneResolverArgs<Partial<TaskWorkspaceEntity>> = {
      id: 'task-id',
      data: {
        status: 'IN_PROGRESS',
        title: 'Any transition should pass for now',
      },
    };
    const authContext = {} as AuthContext;

    const result = await hook.execute(authContext, 'task', payload);

    expect(result).toEqual(payload);
  });

  it('should follow the blocklist pre-query hook pattern', () => {
    const taskHookMetadata = Reflect.getMetadata(
      WORKSPACE_QUERY_HOOK_METADATA,
      TaskPreUpdateHook,
    ) as WorkspaceQueryHookOptions;
    const blocklistHookMetadata = Reflect.getMetadata(
      WORKSPACE_QUERY_HOOK_METADATA,
      BlocklistUpdateOnePreQueryHook,
    ) as WorkspaceQueryHookOptions;

    expect(taskHookMetadata).toEqual(
      expect.objectContaining({
        key: 'task.updateOne',
        type: WorkspaceQueryHookType.PRE_HOOK,
      }),
    );
    expect(blocklistHookMetadata.type).toBe(WorkspaceQueryHookType.PRE_HOOK);
    expect(typeof TaskPreUpdateHook.prototype.execute).toBe('function');
  });
});
