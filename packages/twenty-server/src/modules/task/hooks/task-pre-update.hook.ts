import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  type TaskPreUpdateHookPayload,
  type TaskPreUpdateValidationResult,
} from 'src/modules/task/types/task-status.type';

@WorkspaceQueryHook(`task.updateOne`)
export class TaskPreUpdateHook implements WorkspacePreQueryHookInstance {
  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: TaskPreUpdateHookPayload,
  ): Promise<TaskPreUpdateHookPayload> {
    await this.validateStatusTransition(authContext, payload);

    return payload;
  }

  async validateStatusTransition(
    _authContext: AuthContext,
    _payload: TaskPreUpdateHookPayload,
  ): Promise<TaskPreUpdateValidationResult> {
    return { success: true };
  }
}
