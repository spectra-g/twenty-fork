import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  TaskStatus,
  TaskStatusValidationService,
} from 'src/modules/task/services/task-status-validation.service';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

export interface TaskStatusPreUpdateHookResult {
  success: true;
}

@WorkspaceQueryHook('task.updateOne')
export class TaskStatusPreUpdateHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly taskStatusValidationService: TaskStatusValidationService,
  ) {}

  async handle(): Promise<TaskStatusPreUpdateHookResult> {
    return { success: true };
  }

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<TaskWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<TaskWorkspaceEntity>> {
    await this.handle();

    if (!isDefined(payload.data.status)) {
      return payload;
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const taskRepository =
          await this.globalWorkspaceOrmManager.getRepository<TaskWorkspaceEntity>(
            workspace.id,
            'task',
          );

        const existingTask = await taskRepository.findOne({
          where: { id: payload.id },
          select: { status: true },
        });

        if (!isDefined(existingTask?.status)) {
          return;
        }

        if (!isTaskStatus(existingTask.status) || !isTaskStatus(payload.data.status)) {
          return;
        }

        this.taskStatusValidationService.validateTransition(
          existingTask.status,
          payload.data.status,
        );
      },
      buildSystemAuthContext(workspace.id),
    );

    return payload;
  }
}

const TASK_STATUS_VALUES = Object.values(TaskStatus);

function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUS_VALUES.includes(value as TaskStatus);
}
