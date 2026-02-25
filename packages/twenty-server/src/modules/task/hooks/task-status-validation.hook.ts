import { Injectable } from '@nestjs/common';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type TaskStatus } from 'src/modules/task/enums/task-status.enum';

export type TaskStatusValidationInput = {
  currentStatus: TaskStatus;
  newStatus: TaskStatus;
};

export type TaskStatusValidationResult = {
  success: boolean;
};

@Injectable()
@WorkspaceQueryHook(`task.updateOne`)
export class TaskStatusValidationHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    return payload;
  }

  async validateStatusTransition(
    _input: TaskStatusValidationInput,
  ): Promise<TaskStatusValidationResult> {
    return { success: true };
  }
}
