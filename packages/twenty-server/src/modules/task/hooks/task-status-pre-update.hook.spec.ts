import { BadRequestException } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';

import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { TaskStatusPreUpdateHook } from 'src/modules/task/hooks/task-status-pre-update.hook';
import { TaskQueryHookModule } from 'src/modules/task/query-hooks/task-query-hook.module';

describe('TaskStatusPreUpdateHook', () => {
  it('should be defined', () => {
    const hook = new TaskStatusPreUpdateHook();

    expect(hook).toBeDefined();
  });

  it('should follow the workspace pre-query hook pattern', () => {
    expect(TaskStatusPreUpdateHook.name).toBe('TaskStatusPreUpdateHook');

    const metadata = Reflect.getMetadata(
      WORKSPACE_QUERY_HOOK_METADATA,
      TaskStatusPreUpdateHook,
    );

    expect(metadata).toEqual({
      key: 'task.updateOne',
      type: WorkspaceQueryHookType.PRE_HOOK,
    });

    const scopeMetadata = Reflect.getMetadata(
      SCOPE_OPTIONS_METADATA,
      TaskStatusPreUpdateHook,
    );

    expect(scopeMetadata).toEqual(metadata);
    expect(TaskStatusPreUpdateHook.prototype.execute).toBeInstanceOf(Function);
    expect(TaskStatusPreUpdateHook.prototype.execute.length).toBe(3);
  });

  it('should be registered in task query hook module providers', () => {
    const providers = Reflect.getMetadata('providers', TaskQueryHookModule);

    expect(providers).toContain(TaskStatusPreUpdateHook);
  });

  it('should return payload for valid transitions', async () => {
    const hook = new TaskStatusPreUpdateHook();
    const payload = {
      id: 'task-id',
      data: { status: 'IN_PROGRESS' },
    };

    await expect(
      hook.execute(
        {} as never,
        'task',
        payload,
      ),
    ).resolves.toEqual(payload);
  });

  it('should throw for DONE status updates', async () => {
    const hook = new TaskStatusPreUpdateHook();
    const payload = {
      id: 'task-id',
      data: { status: 'DONE' },
    };

    await expect(
      hook.execute(
        {} as never,
        'task',
        payload,
      ),
    ).rejects.toThrow(BadRequestException);

    await expect(
      hook.execute(
        {} as never,
        'task',
        payload,
      ),
    ).rejects.toThrow('Task is locked: DONE tasks cannot be modified');
  });
});
