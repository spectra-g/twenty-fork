export type TaskUpdateRequest = {
  objectName?: string;
  operation?: string;
  payload?: unknown;
};

export type TaskStatusStateMachineHookResponse = {
  success: true;
  intercepted: true;
};

export class TaskStatusStateMachineHook {
  preUpdate(
    _request: TaskUpdateRequest,
  ): TaskStatusStateMachineHookResponse {
    return {
      success: true,
      intercepted: true,
    };
  }
}
