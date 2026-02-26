import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { TaskPreUpdateHook } from 'src/modules/task/hooks/task-pre-update.hook';
import { TaskStateMachineService } from 'src/modules/task/services/task-state-machine.service';

describe('TaskPreUpdateHook state machine integration', () => {
  let hook: TaskPreUpdateHook;
  let taskStateMachineService: jest.Mocked<TaskStateMachineService>;

  const findOne = jest.fn();
  const globalWorkspaceOrmManager = {
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation((callback: () => Promise<unknown>) => callback()),
    getRepository: jest.fn().mockResolvedValue({ findOne }),
  } as unknown as GlobalWorkspaceOrmManager;

  const authContext = {
    user: { id: 'user-id' },
    workspace: { id: 'workspace-id' },
    userWorkspace: { permissionFlags: ['task:edit'] },
  } as unknown as AuthContext;

  beforeEach(() => {
    taskStateMachineService = {
      validateTransition: jest.fn(),
    } as unknown as jest.Mocked<TaskStateMachineService>;

    findOne.mockReset();
    (
      globalWorkspaceOrmManager.executeInWorkspaceContext as jest.Mock
    ).mockClear();
    (globalWorkspaceOrmManager.getRepository as jest.Mock).mockClear();

    hook = new TaskPreUpdateHook(
      taskStateMachineService,
      globalWorkspaceOrmManager,
    );
  });

  it('should call validateTransition with current and new status (T-08)', async () => {
    findOne.mockResolvedValue({ id: 'task-id', status: 'TODO' });

    await hook.execute(authContext, 'task', {
      id: 'task-id',
      data: { status: 'IN_PROGRESS' },
    });

    expect(taskStateMachineService.validateTransition).toHaveBeenCalledWith(
      'TODO',
      'IN_PROGRESS',
    );
  });

  it('should propagate validation errors (T-08)', async () => {
    findOne.mockResolvedValue({ id: 'task-id', status: 'TODO' });
    taskStateMachineService.validateTransition.mockImplementation(() => {
      throw new Error(
        'Invalid status transition: Cannot move directly from TODO to DONE',
      );
    });

    await expect(
      hook.execute(authContext, 'task', {
        id: 'task-id',
        data: { status: 'DONE' },
      }),
    ).rejects.toThrow(
      'Invalid status transition: Cannot move directly from TODO to DONE',
    );
  });
});
