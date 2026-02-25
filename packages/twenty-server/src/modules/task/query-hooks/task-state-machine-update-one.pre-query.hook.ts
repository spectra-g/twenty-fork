import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TaskStateMachineService } from 'src/engine/metadata-modules/task-status/task-state-machine.service';
import { type TaskStatus } from 'src/engine/metadata-modules/task-status/task-status.types';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

type TaskUpdateOneResolverArgs = UpdateOneResolverArgs<TaskWorkspaceEntity> & {
  currentStatus?: TaskStatus;
};

@WorkspaceQueryHook(`task.updateOne`)
export class TaskStateMachineUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly taskStateMachineService: TaskStateMachineService,
  ) {}

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: TaskUpdateOneResolverArgs,
  ): Promise<TaskUpdateOneResolverArgs> {
    const newStatus = payload.data.status as TaskStatus | undefined;

    if (!newStatus) {
      return payload;
    }

    const currentStatus = payload.currentStatus ?? newStatus;

    this.taskStateMachineService.validateTransition(currentStatus, newStatus);

    return payload;
  }
}
