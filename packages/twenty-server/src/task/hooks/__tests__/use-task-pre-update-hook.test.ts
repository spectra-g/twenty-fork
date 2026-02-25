import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { useTaskPreUpdateHook } from 'src/task/hooks';
import {
  type TaskPreUpdateHookPayload,
  type TaskPreUpdateHookResult,
} from 'src/task/hooks/types/hook-result.type';
import { type TaskStatus } from 'src/task/types/task-status.type';

describe('useTaskPreUpdateHook', () => {
  it('T-01 exports a callable pre-update hook function', () => {
    expect(useTaskPreUpdateHook).toBeDefined();
    expect(typeof useTaskPreUpdateHook).toBe('function');
  });

  it('T-02 returns hardcoded success result', async () => {
    await expect(
      useTaskPreUpdateHook({
        payload: {
          status: 'TODO',
        },
      }),
    ).resolves.toEqual({ isSuccess: true });
  });

  it('T-03 follows naming conventions for hook and file naming', () => {
    expect(useTaskPreUpdateHook.name).toBe('useTaskPreUpdateHook');
    expect(
      existsSync(join(__dirname, '..', 'use-task-pre-update-hook.ts')),
    ).toBe(true);
  });

  it('T-04 provides correct TaskStatus and hook type structures', async () => {
    const taskStatus: TaskStatus = 'DONE';
    const payload: TaskPreUpdateHookPayload = {
      status: taskStatus,
    };
    const result: TaskPreUpdateHookResult = await useTaskPreUpdateHook({
      payload,
    });

    expect(payload).toEqual({ status: 'DONE' });
    expect(result.isSuccess).toBe(true);
  });
});
