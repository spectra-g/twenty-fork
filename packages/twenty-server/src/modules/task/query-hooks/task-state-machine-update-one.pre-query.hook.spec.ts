import { MODULE_METADATA } from '@nestjs/common/constants';

import { TaskStatus } from 'src/engine/metadata-modules/task-status/task-status.types';
import { BlocklistQueryHookModule } from 'src/modules/blocklist/query-hooks/blocklist-query-hook.module';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-one.pre-query.hook';
import { TaskQueryHookModule } from 'src/modules/task/query-hooks/task-query-hook.module';
import { TaskStateMachineUpdateOnePreQueryHook } from 'src/modules/task/query-hooks/task-state-machine-update-one.pre-query.hook';

describe('TaskStateMachineUpdateOnePreQueryHook', () => {
  it('AC-001: should register the state machine hook in TaskQueryHookModule providers', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      TaskQueryHookModule,
    ) as unknown[];

    expect(providers).toContain(TaskStateMachineUpdateOnePreQueryHook);
  });

  it('AC-002: should invoke the state machine validation service when update hook executes', async () => {
    const validateTransition = jest.fn().mockReturnValue(true);
    const hook = new TaskStateMachineUpdateOnePreQueryHook({
      validateTransition,
    } as never);

    const payload = {
      id: 'task-id',
      currentStatus: TaskStatus.TODO,
      data: {
        status: TaskStatus.IN_PROGRESS,
      },
    };

    await expect(
      hook.execute({} as never, 'task', payload),
    ).resolves.toEqual(payload);

    expect(validateTransition).toHaveBeenCalledWith(
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
    );
  });

  it('AC-003: should follow the same class-provider registration style as blocklist hook modules', () => {
    const taskProviders = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      TaskQueryHookModule,
    ) as unknown[];

    const blocklistProviders = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      BlocklistQueryHookModule,
    ) as unknown[];

    expect(taskProviders).toContain(TaskStateMachineUpdateOnePreQueryHook);
    expect(blocklistProviders).toContain(BlocklistUpdateOnePreQueryHook);

    expect(taskProviders.some((provider) => typeof provider === 'function')).toBe(
      true,
    );
    expect(
      blocklistProviders.some((provider) => typeof provider === 'function'),
    ).toBe(true);
  });
});
