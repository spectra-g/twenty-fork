import { Module } from '@nestjs/common';

import { TaskStateMachineService } from 'src/engine/metadata-modules/task-status/task-state-machine.service';

@Module({
  providers: [TaskStateMachineService],
  exports: [TaskStateMachineService],
})
export class TaskStatusModule {}
