import { ForbiddenException } from '@nestjs/common';

import { type WorkspaceQueryHookOptions } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TaskPreUpdateHook } from 'src/modules/task/hooks/task-pre-update.hook';
import { type TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

describe('TaskPreUpdateHook', () => {
  it('should return 403 when no authenticated user is present (AC-001)', async () => {
    const hook = new TaskPreUpdateHook();
    const payload: UpdateOneResolverArgs<Partial<TaskWorkspaceEntity>> = {
      id: 'task-id',
      data: { status: 'DONE' },
    };
    const authContext = {
      user: undefined,
      userWorkspace: {
        permissionFlags: ['task:edit'],
      },
    } as unknown as AuthContext;

    await expect(
      hook.execute(authContext, 'task', payload),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("should return 403 when authenticated user lacks 'task:edit' permission (AC-002)", async () => {
    const hook = new TaskPreUpdateHook();
    const payload: UpdateOneResolverArgs<Partial<TaskWorkspaceEntity>> = {
      id: 'task-id',
      data: { status: 'DONE', title: 'Updated title' },
    };
    const authContext = {
      user: { id: 'user-id' },
      userWorkspace: {
        permissionFlags: ['task:view'],
      },
    } as unknown as AuthContext;

    await expect(
      hook.execute(authContext, 'task', payload),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("should proceed when authenticated user has 'task:edit' permission (AC-003)", async () => {
    const hook = new TaskPreUpdateHook();
    const payload: UpdateOneResolverArgs<Partial<TaskWorkspaceEntity>> = {
      id: 'task-id',
      data: {
        status: 'IN_PROGRESS',
        title: 'Authorized update',
      },
    };
    const authContext = {
      user: { id: 'user-id' },
      userWorkspace: {
        permissionFlags: ['task:edit'],
      },
    } as unknown as AuthContext;

    const result = await hook.execute(authContext, 'task', payload);

    expect(result).toEqual(payload);
  });

  it('should be declared as task.updateOne pre-query hook', () => {
    const taskHookMetadata = Reflect.getMetadata(
      WORKSPACE_QUERY_HOOK_METADATA,
      TaskPreUpdateHook,
    ) as WorkspaceQueryHookOptions;

    expect(taskHookMetadata).toEqual(
      expect.objectContaining({
        key: 'task.updateOne',
        type: WorkspaceQueryHookType.PRE_HOOK,
      }),
    );
    expect(typeof TaskPreUpdateHook.prototype.execute).toBe('function');
  });
});
