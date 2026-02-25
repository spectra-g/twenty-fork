import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

export interface TaskStatusPreUpdateHookResult {
  success: true;
}

@WorkspaceQueryHook('task.updateOne')
export class TaskStatusPreUpdateHook implements WorkspacePreQueryHookInstance {
  async handle(): Promise<TaskStatusPreUpdateHookResult> {
    return { success: true };
  }

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<TaskWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<TaskWorkspaceEntity>> {
    await this.handle();

    return payload;
  }
}
