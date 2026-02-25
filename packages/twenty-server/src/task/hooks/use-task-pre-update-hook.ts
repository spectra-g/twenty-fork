import {
  type TaskPreUpdateHookPayload,
  type TaskPreUpdateHookResult,
} from 'src/task/hooks/types/hook-result.type';

export interface UseTaskPreUpdateHookParams {
  payload: TaskPreUpdateHookPayload;
}

export const useTaskPreUpdateHook = async (
  _params: UseTaskPreUpdateHookParams,
): Promise<TaskPreUpdateHookResult> => {
  return { isSuccess: true };
};
