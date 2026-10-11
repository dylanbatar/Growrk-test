import { randomUUID } from 'node:crypto';
import { ApiError } from '../middlewares/error-contract.js';
import type { Task } from '../models/task.js';
import type { TaskRepository } from '../repositories/interfaces/task-repository.js';
import type { CreateTaskInput } from '../schemas/create-task.js';

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  create(input: CreateTaskInput): Promise<Task> {
    return this.repository.add({
      id: randomUUID(),
      title: input.title,
      status: 'pending',
    });
  }

  list(): Promise<Task[]> {
    return this.repository.listAll();
  }

  async complete(id: string): Promise<Task> {
    const task = await this.repository.findById(id);

    if (!task) {
      throw new ApiError('TASK_NOT_FOUND');
    }

    if (task.status === 'completed') {
      return task;
    }

    return this.repository.update({ ...task, status: 'completed' });
  }
}
