import { BadRequestException } from '@nestjs/common';

import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { TaskStatus } from 'src/modules/task/enums/task-status.enum';

import { TaskPreUpdateHook } from './task-pre-update.hook';

describe('TaskPreUpdateHook', () => {
  it('T-01 / AC-001 should define TaskStatus values', () => {
    expect(TaskStatus.TODO).toBe('TODO');
    expect(TaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
    expect(TaskStatus.DONE).toBe('DONE');
  });

  it('T-02 / AC-002 should be registered as a pre-update hook for task.updateOne', async () => {
    const metadata = Reflect.getMetadata(
      WORKSPACE_QUERY_HOOK_METADATA,
      TaskPreUpdateHook,
    );

    expect(metadata).toMatchObject({
      key: 'task.updateOne',
      type: WorkspaceQueryHookType.PRE_HOOK,
    });

    const hook = new TaskPreUpdateHook();

    const payload = {
      id: 'task-id',
      data: { title: 'Updated title' },
    };

    await expect(
      hook.execute({} as never, 'task', payload),
    ).resolves.toStrictEqual(payload);
  });

  it('T-03 / AC-003 should throw on status transition with expected message', async () => {
    const hook = new TaskPreUpdateHook();

    await expect(
      hook.execute(
        {} as never,
        'task',
        {
          id: 'task-id',
          data: {
            previousStatus: TaskStatus.TODO,
            status: TaskStatus.DONE,
          },
        },
      ),
    ).rejects.toThrow(
      new BadRequestException('Invalid status transition: TODO → DONE'),
    );
  });

  it('T-04 / AC-004 should not throw when updating non-status fields', async () => {
    const hook = new TaskPreUpdateHook();
    const payload = {
      id: 'task-id',
      data: { title: 'Renamed task' },
    };

    await expect(
      hook.execute({} as never, 'task', payload),
    ).resolves.toStrictEqual(payload);
  });
});
