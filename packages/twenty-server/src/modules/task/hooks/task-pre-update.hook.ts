import { BadRequestException } from '@nestjs/common';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type Task } from 'src/modules/task/interfaces/task.interface';

@WorkspaceQueryHook('task.updateOne')
export class TaskPreUpdateHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<Task>,
  ): Promise<UpdateOneResolverArgs<Task>> {
    const nextStatus = payload.data.status;

    if (!nextStatus) {
      return payload;
    }

    const previousStatus =
      payload.data.previousStatus ??
      payload.data.currentStatus ??
      payload.data.fromStatus ??
      null;

    if (previousStatus === nextStatus) {
      return payload;
    }

    throw new BadRequestException(
      `Invalid status transition: ${previousStatus ?? 'UNKNOWN'} → ${nextStatus}`,
    );
  }
}
