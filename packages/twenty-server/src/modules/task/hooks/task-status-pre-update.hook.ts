import { BadRequestException } from '@nestjs/common';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

interface TaskStatusUpdatePayload {
  status?: string | null;
}

@WorkspaceQueryHook('task.updateOne')
export class TaskStatusPreUpdateHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<TaskStatusUpdatePayload>,
  ): Promise<UpdateOneResolverArgs<TaskStatusUpdatePayload>> {
    if (payload.data.status === 'DONE') {
      throw new BadRequestException(
        'Task is locked: DONE tasks cannot be modified',
      );
    }

    return payload;
  }
}
