import { Module } from '@nestjs/common';

import { TaskStatusModule } from 'src/engine/metadata-modules/task-status/task-status.module';
import { TaskDeleteManyPostQueryHook } from 'src/modules/task/query-hooks/task-delete-many.post-query.hook';
import { TaskDeleteOnePostQueryHook } from 'src/modules/task/query-hooks/task-delete-one.post-query.hook';
import { TaskPostQueryHookService } from 'src/modules/task/query-hooks/task-post-query-hook.service';
import { TaskRestoreManyPostQueryHook } from 'src/modules/task/query-hooks/task-restore-many.post-query.hook';
import { TaskRestoreOnePostQueryHook } from 'src/modules/task/query-hooks/task-restore-one.post-query.hook';
import { TaskStateMachineUpdateOnePreQueryHook } from 'src/modules/task/query-hooks/task-state-machine-update-one.pre-query.hook';

@Module({
  imports: [TaskStatusModule],
  providers: [
    TaskPostQueryHookService,
    TaskStateMachineUpdateOnePreQueryHook,
    TaskDeleteManyPostQueryHook,
    TaskDeleteOnePostQueryHook,
    TaskRestoreManyPostQueryHook,
    TaskRestoreOnePostQueryHook,
  ],
})
export class TaskQueryHookModule {}
