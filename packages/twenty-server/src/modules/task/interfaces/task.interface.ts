import { TaskStatus } from 'src/modules/task/enums/task-status.enum';

export interface Task {
  id: string;
  title?: string | null;
  status?: TaskStatus | null;
  previousStatus?: TaskStatus | null;
  currentStatus?: TaskStatus | null;
  fromStatus?: TaskStatus | null;
}
