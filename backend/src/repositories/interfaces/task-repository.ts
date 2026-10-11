import type { Task } from '../../models/task.js';

export type TaskRepository = {
  add(task: Task): Promise<Task>;
};
