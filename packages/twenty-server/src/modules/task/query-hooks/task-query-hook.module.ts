import { Module } from '@nestjs/common';

import { TaskStatusPreUpdateHook } from 'src/modules/task/hooks/task-status-pre-update.hook';
import { TaskDeleteManyPostQueryHook } from 'src/modules/task/query-hooks/task-delete-many.post-query.hook';
import { TaskDeleteOnePostQueryHook } from 'src/modules/task/query-hooks/task-delete-one.post-query.hook';
import { TaskPostQueryHookService } from 'src/modules/task/query-hooks/task-post-query-hook.service';
import { TaskRestoreManyPostQueryHook } from 'src/modules/task/query-hooks/task-restore-many.post-query.hook';
import { TaskRestoreOnePostQueryHook } from 'src/modules/task/query-hooks/task-restore-one.post-query.hook';
import { TaskStatusSecurityService } from 'src/modules/task/services/task-status-security.service';

@Module({
  providers: [
    TaskStatusPreUpdateHook,
    TaskStatusSecurityService,
    TaskPostQueryHookService,
    TaskDeleteManyPostQueryHook,
    TaskDeleteOnePostQueryHook,
    TaskRestoreManyPostQueryHook,
    TaskRestoreOnePostQueryHook,
  ],
})
export class TaskQueryHookModule {}
