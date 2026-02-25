import { randomUUID } from 'crypto';

import { TaskStatus } from 'src/modules/task/enums/task-status.enum';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { findOneOperation } from 'test/integration/graphql/utils/find-one-operation.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

const TASK_GQL_FIELDS = `
  id
  status
  title
  dueAt
`;

const createTask = async ({
  id = randomUUID(),
  status = TaskStatus.TODO,
  title = 'Task title',
}: {
  id?: string;
  status?: TaskStatus;
  title?: string;
}) => {
  const response = await createOneOperation({
    objectMetadataSingularName: 'task',
    gqlFields: TASK_GQL_FIELDS,
    input: {
      id,
      title,
      status,
    },
  });

  return response.data.createOneResponse;
};

const findTaskById = async (id: string) => {
  const response = await findOneOperation({
    objectMetadataSingularName: 'task',
    gqlFields: TASK_GQL_FIELDS,
    filter: { id: { eq: id } },
  });

  return response.data.findResponse;
};

const getFirstErrorMessage = (body: Record<string, unknown>) => {
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    return body.messages[0];
  }

  if (typeof body.message === 'string') {
    return body.message;
  }

  return undefined;
};

describe('Task state machine integration (REST update)', () => {
  beforeEach(async () => {
    await deleteAllRecords('taskTarget');
    await deleteAllRecords('task');
  });

  it('T-01 / AC-001 updates TODO → IN_PROGRESS and persists to DB', async () => {
    const task = await createTask({ status: TaskStatus.TODO });

    const response = await makeRestAPIRequest({
      method: 'patch',
      path: `/tasks/${task.id}`,
      body: { status: TaskStatus.IN_PROGRESS },
    });

    expect(response.status).toBe(200);
    expect(response.body.data.updateTask.status).toBe(TaskStatus.IN_PROGRESS);

    const persistedTask = await findTaskById(task.id);

    expect(persistedTask.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('T-02 / AC-002 updates IN_PROGRESS → DONE and persists to DB', async () => {
    const task = await createTask({ status: TaskStatus.IN_PROGRESS });

    const response = await makeRestAPIRequest({
      method: 'patch',
      path: `/tasks/${task.id}`,
      body: { status: TaskStatus.DONE },
    });

    expect(response.status).toBe(200);
    expect(response.body.data.updateTask.status).toBe(TaskStatus.DONE);

    const persistedTask = await findTaskById(task.id);

    expect(persistedTask.status).toBe(TaskStatus.DONE);
  });

  it('T-03 / AC-003 rejects all invalid state transitions with 400 and specific error messages', async () => {
    const invalidTransitions: Array<{
      from: TaskStatus;
      to: TaskStatus;
      expectedMessage: string;
    }> = [
      {
        from: TaskStatus.TODO,
        to: TaskStatus.DONE,
        expectedMessage: 'Invalid status transition: TODO → DONE',
      },
      {
        from: TaskStatus.IN_PROGRESS,
        to: TaskStatus.TODO,
        expectedMessage: 'Invalid status transition: IN_PROGRESS → TODO',
      },
      {
        from: TaskStatus.DONE,
        to: TaskStatus.IN_PROGRESS,
        expectedMessage:
          'Invalid status transition: DONE → IN_PROGRESS. Task is locked in DONE state',
      },
      {
        from: TaskStatus.DONE,
        to: TaskStatus.TODO,
        expectedMessage:
          'Invalid status transition: DONE → TODO. Task is locked in DONE state',
      },
    ];

    for (const [index, transition] of invalidTransitions.entries()) {
      const task = await createTask({
        id: randomUUID(),
        status: transition.from,
        title: `Invalid transition task ${index}`,
      });

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/tasks/${task.id}`,
        body: { status: transition.to },
      });

      expect(response.status).toBe(400);
      expect(getFirstErrorMessage(response.body)).toBe(transition.expectedMessage);

      const persistedTask = await findTaskById(task.id);

      expect(persistedTask.status).toBe(transition.from);
    }
  });

  it('T-04 / AC-004 allows non-status updates for tasks in TODO, IN_PROGRESS, and DONE', async () => {
    const taskTodo = await createTask({
      status: TaskStatus.TODO,
      title: 'TODO task',
    });
    const taskInProgress = await createTask({
      status: TaskStatus.IN_PROGRESS,
      title: 'IN_PROGRESS task',
    });
    const taskDone = await createTask({
      status: TaskStatus.DONE,
      title: 'DONE task',
    });

    const updates = [
      { id: taskTodo.id, status: TaskStatus.TODO, title: 'TODO task updated' },
      {
        id: taskInProgress.id,
        status: TaskStatus.IN_PROGRESS,
        title: 'IN_PROGRESS task updated',
      },
      { id: taskDone.id, status: TaskStatus.DONE, title: 'DONE task updated' },
    ];

    for (const update of updates) {
      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/tasks/${update.id}`,
        body: {
          title: update.title,
          dueAt: '2031-01-15T00:00:00.000Z',
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.data.updateTask.title).toBe(update.title);
      expect(response.body.data.updateTask.status).toBe(update.status);

      const persistedTask = await findTaskById(update.id);

      expect(persistedTask.title).toBe(update.title);
      expect(persistedTask.status).toBe(update.status);
    }
  });
});
