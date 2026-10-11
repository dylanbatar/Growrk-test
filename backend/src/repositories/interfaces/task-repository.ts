import type { Task } from '../../models/task.js';

export type TaskRepository = {
  add(task: Task): Promise<Task>;
  listAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | undefined>;
  update(task: Task): Promise<Task>;
};
