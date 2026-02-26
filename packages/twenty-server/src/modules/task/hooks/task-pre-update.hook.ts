import { ForbiddenException, Injectable } from '@nestjs/common';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

@Injectable()
@WorkspaceQueryHook(`task.updateOne`)
export class TaskPreUpdateHook implements WorkspacePreQueryHookInstance {
  private static readonly TASK_EDIT_PERMISSION = 'task:edit';

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<Partial<TaskWorkspaceEntity>>,
  ): Promise<UpdateOneResolverArgs<Partial<TaskWorkspaceEntity>>> {
    const hasAuthenticatedUser = Boolean(authContext?.user?.id);
    const taskPermissions =
      (authContext?.userWorkspace?.permissionFlags as unknown as string[]) ??
      [];
    const canEditTask = taskPermissions.includes(
      TaskPreUpdateHook.TASK_EDIT_PERMISSION,
    );

    if (!hasAuthenticatedUser || !canEditTask) {
      throw new ForbiddenException();
    }

    return payload;
  }
}
