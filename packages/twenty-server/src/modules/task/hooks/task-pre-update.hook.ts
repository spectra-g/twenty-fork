import { ForbiddenException, Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { TaskStateMachineService } from 'src/modules/task/services/task-state-machine.service';
import { type TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

@Injectable()
@WorkspaceQueryHook(`task.updateOne`)
export class TaskPreUpdateHook implements WorkspacePreQueryHookInstance {
  private static readonly TASK_EDIT_PERMISSION = 'task:edit';

  constructor(
    private readonly taskStateMachineService: TaskStateMachineService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

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

    const newStatus = payload.data.status;

    if (typeof newStatus === 'string') {
      const workspace = authContext.workspace;

      assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

      const systemAuthContext = buildSystemAuthContext(workspace.id);

      const task = await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const taskRepository =
            await this.globalWorkspaceOrmManager.getRepository<TaskWorkspaceEntity>(
              workspace.id,
              'task',
            );

          return taskRepository.findOne({
            where: { id: payload.id },
          });
        },
        systemAuthContext,
      );

      if (isDefined(task?.status) && task.status !== newStatus) {
        this.taskStateMachineService.validateTransition(task.status, newStatus);
      }
    }

    return payload;
  }
}
