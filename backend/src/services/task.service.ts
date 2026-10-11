import { randomUUID } from 'node:crypto';
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
}
