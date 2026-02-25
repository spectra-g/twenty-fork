import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface TaskPreUpdateHookData {
  status?: TaskStatus;
}

export type TaskPreUpdateHookPayload =
  UpdateOneResolverArgs<TaskPreUpdateHookData>;

export interface TaskPreUpdateValidationResult {
  success: true;
}
