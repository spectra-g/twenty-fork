import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { TaskStatus } from 'src/modules/task/enums/task-status.enum';
import { validateTransition } from 'src/modules/task/utils/task-status-machine';

import { ValidateTaskStatusTransitionHook } from './validate-task-status-transition.hook';

jest.mock('src/modules/task/utils/task-status-machine', () => ({
  validateTransition: jest.fn(),
}));

describe('ValidateTaskStatusTransitionHook', () => {
  const mockedValidateTransition = jest.mocked(validateTransition);

  beforeEach(() => {
    mockedValidateTransition.mockReset();
  });

  it('should be registered as a pre-update hook for task.updateOne', () => {
    const metadata = Reflect.getMetadata(
      WORKSPACE_QUERY_HOOK_METADATA,
      ValidateTaskStatusTransitionHook,
    );

    expect(metadata).toMatchObject({
      key: 'task.updateOne',
      type: WorkspaceQueryHookType.PRE_HOOK,
    });
  });

  it('T-07 / AC-006 validates non-status field updates bypass state machine', async () => {
    const hook = new ValidateTaskStatusTransitionHook();
    const payload = {
      id: 'task-id',
      data: { title: 'Renamed task' },
    };

    await expect(
      hook.execute({} as never, 'task', payload),
    ).resolves.toStrictEqual(payload);
    expect(mockedValidateTransition).not.toHaveBeenCalled();
  });

  it('T-08 / AC-001-006 validates hook integrates with state machine and calls it appropriately', async () => {
    const hook = new ValidateTaskStatusTransitionHook();
    const payload = {
      id: 'task-id',
      data: {
        previousStatus: TaskStatus.TODO,
        status: TaskStatus.IN_PROGRESS,
      },
    };

    await expect(
      hook.execute({} as never, 'task', payload),
    ).resolves.toStrictEqual(payload);
    expect(mockedValidateTransition).toHaveBeenCalledWith(
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
    );
  });
});
